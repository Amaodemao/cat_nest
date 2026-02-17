import { NavLink, type NavLinkProps } from "react-router-dom";
import { useViewTransitionNavigate } from "../hooks/useViewTransitionNavigate";

export default function ViewTransitionNavLink(props: NavLinkProps) {
  const {
    onClick,
    to,
    replace,
    state,
    target,
    preventScrollReset,
    relative,
    reloadDocument,
    ...rest
  } = props;
  const navigate = useViewTransitionNavigate();

  const handleClick: NavLinkProps["onClick"] = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (reloadDocument) return;
    if (
      event.button !== 0 ||
      target === "_blank" ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();
    void navigate(to, { replace, state, preventScrollReset, relative });
  };

  return (
    <NavLink
      {...rest}
      to={to}
      replace={replace}
      state={state}
      target={target}
      preventScrollReset={preventScrollReset}
      relative={relative}
      reloadDocument={reloadDocument}
      onClick={handleClick}
    />
  );
}
