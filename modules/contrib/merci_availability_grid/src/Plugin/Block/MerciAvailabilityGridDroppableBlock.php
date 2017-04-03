<?php

namespace Drupal\merci_availability_grid\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormBase;

/**
 * @Block(
 *   id = "merci_availability_grid_droppable_block",
 *   admin_label = @Translation("Merci Availability Grid Droppable Block"),
 *   category = @Translation("Custom blocks"),
 * )
 */
class MerciAvailabilityGridDroppableBlock extends BlockBase
{
    /**
   * {@inheritdoc}
   */
    public function build() 
    {
        $content = '<div id="extensionArea">Extend Reservation by 15 Minutes</div>';
        $content .= '<div id="cancelArea">Cancel Reservation</div>';
        $content .= '<div id="checkOutArea">Check-Out Room</div>';
        $content .= '<div id="checkInArea">Check-In Room</div>';
        return [
        '#markup' => $content,
        ];
    }
}
