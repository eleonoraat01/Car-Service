import { getUserData } from '@db';

const adminNavigation = /**@type {NodeListOf<Element>}*/(document.querySelectorAll('.admin-navigation'));
const userNavigation = /**@type {NodeListOf<Element>}*/(document.querySelectorAll('.user-navigation'));
const guestNavigation = /**@type {NodeListOf<Element>}*/(document.querySelectorAll('.guest-navigation'));

/**
 * @description Updates the navigation bar based on whether the user is logged in or not.
 * @param {Context} [ctx] - The context object.
 */
export function updateNavigation(ctx) {
  const user = getUserData();
  const isAdmin = user && user.isSuperUser;
  const browseAsUser = ctx && ctx.pathname.includes('/cars');

  adminNavigation.forEach((element) => {
    if (isAdmin) element.removeAttribute('hidden');
    else element.setAttribute('hidden', '');
  });

  userNavigation.forEach((element) => {
    if ((user && !isAdmin) || (isAdmin && browseAsUser)) {
      element.removeAttribute('hidden');
      if (isAdmin && browseAsUser) updatePathForAdmin(ctx);
    } else if (!isAdmin) element.setAttribute('hidden', '');
  });

  guestNavigation.forEach((element) => {
    if (!user) element.removeAttribute('hidden');
    else element.setAttribute('hidden', '');
  });
}

/**
 * @description Updates the path for admin based on the provided context.
 * @param {Context} ctx - The context object containing the necessary information.
 */
function updatePathForAdmin(ctx) {
  const base = import.meta.env.VITE_APP_HOST_URL;

  userNavigation.forEach((element) => {
    Array.from(element.children).forEach(child => {
      const link = /**@type {HTMLAnchorElement}*/(child.firstChild);
      const href = link.getAttribute('href') || '';

      if (link.id || href.includes('/admin')) return;

      const newHref = `${ctx.page.base()}${href.replace(base, '')}`;
      link.setAttribute('href', newHref);
    });
  });
}