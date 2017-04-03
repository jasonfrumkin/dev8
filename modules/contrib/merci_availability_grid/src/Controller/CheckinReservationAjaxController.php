<?php
/**
 * @file
 * Contains \Drupal\merci_availability_grid\Controller\CheckinReservationAjaxController.
 */

namespace Drupal\merci_availability_grid\Controller;

class CheckinReservationAjaxController
{

    public function CheckinReservationCallback() 
    {
        $response = new \Drupal\Core\Ajax\AjaxResponse();
        $response->addCommand(new \Drupal\merci_availability_grid\Ajax\CheckinReservationCommand());
        return $response;
    }

}
