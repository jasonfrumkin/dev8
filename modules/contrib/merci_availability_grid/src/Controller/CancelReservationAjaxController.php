<?php
/**
 * @file
 * Contains \Drupal\merci_availability_grid\Controller\CancelReservationAjaxController.
 */

namespace Drupal\merci_availability_grid\Controller;

class CancelReservationAjaxController
{

    public function CancelReservationCallback() 
    {
        $response = new \Drupal\Core\Ajax\AjaxResponse();
        $response->addCommand(new \Drupal\merci_availability_grid\Ajax\CancelReservationCommand());
        return $response;
    }

}
