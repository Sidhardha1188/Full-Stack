// End-to-end tests using Node's built-in test runner.
// Start the server first (npm start), then run: npm test
const test = require('node:test');
const assert = require('node:assert');

const BASE = process.env.API_URL || 'http://localhost:4000/api/v1';
const tag = Date.now().toString().slice(-6);
const day = n => new Date(Date.now() + n * 864e5).toISOString();

async function api(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body)
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

const ctx = {};

test('health check', async () => {
  const r = await api('GET', '/health');
  assert.equal(r.status, 200);
});

test('create an event with 2 seats', async () => {
  const r = await api('POST', '/events', {
    title: `Test Event ${tag}`, type: 'Workshop', venue: 'Lab 1',
    startsAt: day(7), registrationCloses: day(5), capacity: 2, organiser: 'Tests',
    seatsTaken: 999 // should be ignored by the pick() middleware
  });
  assert.equal(r.status, 201);
  ctx.event = r.body.item._id;
});

test('invalid event is rejected with 422', async () => {
  const r = await api('POST', '/events', { title: '', type: 'Party', capacity: 0 });
  assert.equal(r.status, 422);
  assert.ok(r.body.details.type);
});

test('registration closing after the start date is rejected', async () => {
  const r = await api('POST', '/events', { title: 'Bad dates', type: 'Seminar', venue: 'X', startsAt: day(2), registrationCloses: day(3), capacity: 5, organiser: 'T' });
  assert.equal(r.status, 422);
});

test('malformed JSON gives 400', async () => {
  const r = await api('POST', '/events', '{bad json');
  assert.equal(r.status, 400);
});

test('create three participants', async () => {
  ctx.people = [];
  for (const [i, branch] of ['CSM', 'CSE', 'ECE'].entries()) {
    const r = await api('POST', '/participants', { rollNo: `T${tag}0000${i}`, name: `Tester ${i}`, email: `t${tag}${i}@mail.com`, branch, year: 2 });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    ctx.people.push(r.body.item._id);
  }
});

test('duplicate email gives 409', async () => {
  const r = await api('POST', '/participants', { rollNo: `T${tag}00009`, name: 'Copy', email: `t${tag}0@mail.com`, branch: 'IT', year: 1 });
  assert.equal(r.status, 409);
});

test('first two are confirmed, third is waitlisted', async () => {
  const regs = [];
  for (const p of ctx.people) regs.push(await api('POST', '/registrations', { eventId: ctx.event, participantId: p }));
  assert.deepEqual(regs.map(r => r.body.item.status), ['Confirmed', 'Confirmed', 'Waitlisted']);
  assert.equal(regs[2].body.item.waitlistPosition, 1);
  ctx.regs = regs.map(r => r.body.item._id);
});

test('same person cannot register twice', async () => {
  const r = await api('POST', '/registrations', { eventId: ctx.event, participantId: ctx.people[0] });
  assert.equal(r.status, 409);
});

test('event shows 0 seats left and 1 waitlisted', async () => {
  const r = await api('GET', `/events/${ctx.event}`);
  assert.equal(r.body.item.seatsLeft, 0);
  assert.equal(r.body.item.waitlisted, 1);
});

test('capacity cannot drop below seats taken', async () => {
  const r = await api('PATCH', `/events/${ctx.event}`, { capacity: 1 });
  assert.equal(r.status, 409);
});

test('cancelling a confirmed seat promotes the waitlist', async () => {
  const r = await api('PATCH', `/registrations/${ctx.regs[0]}/cancel`);
  assert.equal(r.status, 200);
  assert.equal(r.body.promoted._id, ctx.regs[2]);
  const promoted = await api('GET', `/registrations/${ctx.regs[2]}`);
  assert.equal(promoted.body.item.status, 'Confirmed');
});

test('check-in works only for confirmed registrations', async () => {
  const ok = await api('PATCH', `/registrations/${ctx.regs[1]}/check-in`);
  assert.equal(ok.status, 200);
  assert.equal(ok.body.item.status, 'CheckedIn');
  const bad = await api('PATCH', `/registrations/${ctx.regs[0]}/check-in`);
  assert.equal(bad.status, 409);
});

test('stats group registrations by branch', async () => {
  const r = await api('GET', `/events/${ctx.event}/stats`);
  assert.equal(r.status, 200);
  const branches = r.body.byBranch.map(b => b._id).sort();
  assert.deepEqual(branches, ['CSE', 'ECE']);
});

test('event with registrations cannot be deleted, but can be cancelled', async () => {
  assert.equal((await api('DELETE', `/events/${ctx.event}`)).status, 409);
  const c = await api('POST', `/events/${ctx.event}/cancel`);
  assert.equal(c.status, 200);
  const late = await api('POST', '/registrations', { eventId: ctx.event, participantId: ctx.people[0] });
  assert.equal(late.status, 410);
});

test('bad id and unknown route', async () => {
  assert.equal((await api('GET', '/events/123')).status, 400);
  assert.equal((await api('GET', '/nowhere')).status, 404);
});
