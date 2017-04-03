<?php
/**
 * @file
 * Contains \Drupal\merci_availability_grid\Controller\ExtendReservationAjaxController.
 */

namespace Drupal\merci_availability_grid\Controller;

class ExtendReservationAjaxController
{

    public function ExtendReservationCallback() 
    {
        $response = new \Drupal\Core\Ajax\AjaxResponse();
        $response->addCommand(new \Drupal\merci_availability_grid\Ajax\ExtendReservationCommand());
        return $response;
    }

}
