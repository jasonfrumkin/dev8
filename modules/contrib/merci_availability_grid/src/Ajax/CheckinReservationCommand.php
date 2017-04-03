<?php

namespace Drupal\merci_availability_grid\Ajax;

use Drupal\Core\Ajax\CommandInterface;
use Drupal\Core\Datetime;

class CheckinReservationCommand implements CommandInterface
{

    public function render() 
    {
        $nid = $_GET['nid'];
        $node = \Drupal\node\Entity\Node::load($nid);
        $node->set("field_reservation_status", '4');
        $node->save();
        return array(
        'command' => 'CheckinReservationCommand',
        'data' => 'This reservation has been Checked In!',
        );
    }
}
