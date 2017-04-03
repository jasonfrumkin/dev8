<?php

namespace Drupal\merci_availability_grid\Ajax;

use Drupal\Core\Ajax\CommandInterface;
use Drupal\Core\Datetime;

class ModifyReservationCommand implements CommandInterface
{

    public function render()
    {
        $nid = $_GET['nid'];
        $item = $_GET['item'];
        $newItem = $_GET['newItem'];
        $date = $_GET['date'];
        $start = $date . "T" . $_GET['start'];
        $count = $_GET['count'];

        $minutes_to_add = 15 * $count;
        $newStart = new \DateTime($date . $_GET['start']);
        $newStart->setTimeZone(new \DateTimeZone('UTC'));
        $newEnd = new \DateTime($date . $_GET['start']);
        $newEnd->modify('+' . $minutes_to_add . ' minutes');
        $newEnd->modify('-15 seconds');
        $newEnd->setTimeZone(new \DateTimeZone('UTC'));
        $node = \Drupal\node\Entity\Node::load($nid);
        $updVals[0]['value'] = $newStart->format('Y-m-d\TH:i:s');
        $updVals[0]['value2'] = $newEnd->format('Y-m-d\TH:i:s');
        $node->set("merci_reservation_date", $updVals);
        $node->set("merci_reservation_items", $newItem);
        $node->save();
        return array(
        'command' => 'ModifyReservationCommand',
        'data' => $start,
        );
    }
}
