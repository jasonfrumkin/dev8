<?php
/**
 * @file
 * Contains \Drupal\merci_availability_grid\Controller\ModifyReservationAjaxController.
 */

namespace Drupal\merci_availability_grid\Controller;

class ModifyReservationAjaxController
{

    public function ModifyReservationCallback() 
    {
        $response = new \Drupal\Core\Ajax\AjaxResponse();
        $response->addCommand(new \Drupal\merci_availability_grid\Ajax\ModifyReservationCommand());
        return $response;
    }

}
