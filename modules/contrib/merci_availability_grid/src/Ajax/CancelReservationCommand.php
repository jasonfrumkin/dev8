<?php

namespace Drupal\merci_availability_grid\Ajax;

use Drupal\Core\Ajax\CommandInterface;
use Drupal\Core\Datetime;

class CancelReservationCommand implements CommandInterface
{

    public function render() 
    {
        $nid = $_GET['nid'];
        $node = \Drupal\node\Entity\Node::load($nid);
        $node->set("field_reservation_status", '5');
        $node->save();
        return array(
        'command' => 'CancelReservationCommand',
        'data' => 'This Reservation has been cancelled!',
        );
    }
}
