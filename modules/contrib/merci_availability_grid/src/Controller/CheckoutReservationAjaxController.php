<?php
/**
 * @file
 * Contains \Drupal\merci_availability_grid\Controller\CheckoutReservationAjaxController.
 */

namespace Drupal\merci_availability_grid\Controller;

class CheckoutReservationAjaxController
{

    public function CheckoutReservationCallback() 
    {
        $response = new \Drupal\Core\Ajax\AjaxResponse();
        $response->addCommand(new \Drupal\merci_availability_grid\Ajax\CheckoutReservationCommand());
        return $response;
    }

}
