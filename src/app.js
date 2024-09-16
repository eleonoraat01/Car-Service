// @ts-nocheck
import page from 'page';
import { decorateContext } from './middleware/render';
import { loginPage, registerPage, onLogout, adminPage, carsCatalogPage, createCarPage, editCarPage, repairsCatalogPage, createRepairPage, detailsRepairPage, editRepairPage } from '@views';

document.getElementById('logout-button')?.addEventListener('click', onLogout);

page.base(import.meta.env.VITE_APP_HOST_URL);

page(decorateContext);
page('/user/login', loginPage);
page('/user/register', registerPage);
page('/admin', adminPage);
page(['/cars', '/admin/:userId/cars'], carsCatalogPage);
page(['/cars/create', '/admin/:userId/cars/create'], createCarPage);
page(['/cars/:carId/edit', 'admin/:userId/cars/:carId/edit'], editCarPage);
page(['/cars/:carId/repairs', 'admin/:userId/cars/:carId/repairs'], repairsCatalogPage);
page(['/cars/:carId/repairs/create', 'admin/:userId/cars/:carId/repairs/create'], createRepairPage);
page(['/cars/:carId/repairs/:repairId', 'admin/:userId/cars/:carId/repairs/:repairId'], detailsRepairPage);
page(['/cars/:carId/repairs/:repairId/edit', 'admin/:userId/cars/:carId/repairs/:repairId/edit'], editRepairPage);

page.start();