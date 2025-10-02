/*
const links = {...};

const bars = {};


<NavLink bar={bars.tarinings} >
...
</NavLink>

<Link to={links.trainingPage} params={...} >
...
</Link>



При клике на навлинк открываем 

*/

export { Link, type LinkProps } from './ui/Link';
export { NavLink, type NavLinkProps } from './ui/NavLink';
export { useNavigator, useNavigate, useNavigationState, NavigatorProvider, type Tab } from './ui/Navigator';