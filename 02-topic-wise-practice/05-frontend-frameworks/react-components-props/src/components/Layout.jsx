// Composition: "children" fills the main area and "footer" is a JSX element passed as a prop
function Layout({ title, children, footer }) {
  return (
    <div className="layout">
      <header><h1>{title}</h1></header>
      <main>{children}</main>
      {footer && <footer>{footer}</footer>}
    </div>
  );
}

export default Layout;
