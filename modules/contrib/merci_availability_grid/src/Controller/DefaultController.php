<?php /**
 * @file
 * Contains \Drupal\merci_availability_grid\Controller\DefaultController.
 */

namespace Drupal\merci_availability_grid\Controller;

use Drupal\Core\Config\Entity\Query\Query;
use Drupal\Core\Entity\Query\QueryFactory;
use Drupal\Core\Entity\Query\QueryInterface;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Database\Connection;
use Drupal\Component\Utility\Crypt;
use Symfony\Component\DependencyInjection\ContainerInterface;


/**
 * Default controller for the merci_availability_grid module.
 */
class DefaultController extends ControllerBase {

  protected $database;

  public function __construct(Connection $database) {
    $this->database = $database;
  }

  public static function create(ContainerInterface $container) {
    return new static($container->get('database'));
  }

  public function merci_availability_grid_availability_page() {
    $tempstore = \Drupal::service('user.private_tempstore')->get('merci_availability_grid');
    $start_date = $tempstore->get('get_start_date');
    if(!isset($start_date)){
      $start_date = date('Y-m-d H:i:s');
    }
    $group_selection = $tempstore->get('group_entity');
    $room_selection = $tempstore->get('get_room_selection');
    $availForm = \Drupal::formBuilder()->getForm('Drupal\merci_availability_grid\Form\MerciAvailabilityGridMain');
    $avail_form_build['results'] = array(
      '#theme' => 'merci_availability_grid_theme_availability_grid',
      '#avail_form' => $availForm,
    );
    $avail_form[] = $avail_form_build;
    //$avail_form_final = \Drupal::service("renderer")->render($avail_form);

    if (!empty($start_date)) {
      $conflictInfo = self::conflict_grid();
      $conflict_grid_build['results'] = array(
        '#theme' => 'merci_availability_grid_theme_conflict',
        '#conflict_info' => $conflictInfo,
      );
    }
    $conflict_grid[] = $conflict_grid_build;
    //$conflict_grid_final = \Drupal::service("renderer")->render($conflict_grid);

    $prevForm = \Drupal::formBuilder()->getForm('Drupal\merci_availability_grid\Form\MerciAvailabilityGridPrev');
    $prev_form_build['results'] = array(
      '#theme' => 'merci_availability_grid_theme_prev',
      '#prev_form' => $prevForm,
    );
    $previous_form[] = $prev_form_build;
    //$previous_form_final = \Drupal::service("renderer")->render($previous_form);

    $nextForm = \Drupal::formBuilder()->getForm('Drupal\merci_availability_grid\Form\MerciAvailabilityGridNext');
    $next_form_build['results'] = array(
      '#theme' => 'merci_availability_grid_theme_next',
      '#next_form' => $nextForm,
    );
    $next_form[] = $next_form_build;
    //$next_form_final = \Drupal::service("renderer")->render($next_form);
    //
    $result_page_build['results'] = array(
      '#theme' => 'availability_grid',
      '#avail_form' => $avail_form,
      '#conflict_info' => $conflict_grid,
      '#prev_form' => $previous_form,
      '#next_form' => $next_form,
    );
    return $result_page_build;
  }

  public function conflict_grid(){
    $tempstore = \Drupal::service('user.private_tempstore')->get('merci_availability_grid');
    $get_start_date = $tempstore->get('get_start_date');
    $get_room_selection = $tempstore->get('get_room_selection');
  if (isset($get_start_date)){
    $display_date=date('n-d-Y', strtotime("-1 day", strtotime($get_start_date)));
    $start_date=date("Y-m-d", strtotime($get_start_date))."T05:00:01";
    $start_date1=date("Y-m-d", strtotime($get_start_date));
    $end_date=date("Y-m-d", strtotime("+1 day", strtotime($get_start_date)))."T04:59:59";
  }
  else {
    $get_start_date = date('Y-m-d', $tempstore->get('get_start_date'));
    $display_date=date('n-d-Y', strtotime("-1 day", $tempstore->get('get_start_date')));
    $start_date=date("Y-m-d", strtotime($get_start_date))."T05:00:01";
    $start_date1=date("Y-m-d", strtotime($get_start_date));
    $end_date=date("Y-m-d", strtotime("+1 day", strtotime($get_start_date)))."T04:59:59";
  }

$output = '<div class="merci-availability-key" style="float:left;height:30px;width:100%;">';
$output .= '<span class="available" style="background-color:#83D783; display:inline-block; height:1.2em; width:1.2em;"></span> = Available';
$output .= '<span class="unavailable" style="margin-left:7px; background-color:#c99 !important; display:inline-block; height:1.2em; width:1.2em;"></span> = Reserved';
$output .= '<span class="notAvailable_checkout" style="margin-left:7px; background-color:#C55B5B; display: inline-block; height: 1.2em; width: 1.2em;"></span> = In Use';
$output .= '</div>';
$output .= '<div class="Table" id="selectable">';
 $output .= '<div class="Heading">';
 $output .= '<div class="HeadingOffset">&nbsp;</div>';
  $output .= '<div id="roomID" class="Cell header headerSortDown"></div>';
      $output .= '<div class="Cell">7am </div>';
      $output .= '<div class="Cell">8am </div>';
      $output .= '<div class="Cell">9am </div>';
      $output .= '<div class="Cell">10am </div>';
      $output .= '<div class="Cell">11am </div>';
      $output .= '<div class="Cell">12pm </div>';
      $output .= '<div class="Cell">1pm </div>';
      $output .= '<div class="Cell">2pm </div>';
      $output .= '<div class="Cell">3pm </div>';
      $output .= '<div class="Cell">4pm </div>';
      $output .= '<div class="Cell">5pm </div>';
      $output .= '<div class="Cell">6pm </div>';
      $output .= '<div class="Cell">7pm </div>';
      $output .= '<div class="Cell">8pm </div>';
      $output .= '<div class="Cell">9pm </div>';
  $output .= '</div>';
$dt = new \DateTime();
$tz = new \DateTimeZone('CST');
if (date('I')==1){
  $offset = $tz->getOffset($dt)+3600;
} else {
  $offset = $tz->getOffset($dt);
}
  $finalNodes = $get_room_selection;
  foreach($finalNodes as $name => $room) {
    $names = self::node_load_title($room);
    foreach ($names as $nam) {
         $name = $nam->title;
    }
    $use_nid=$room;
    $use_margin=$room;
    $confirmed_status_value='confirmed';
    $query = 'SELECT node.nid as itemfinder,
                fdfrs.field_reservation_status_value as merci_item_status,
                fdfd.merci_reservation_date_value as reservation_start_time,
                fdfd.merci_reservation_date_value2 as reservation_end_time,
                TIMESTAMPDIFF(MINUTE,fdfd.merci_reservation_date_value,fdfd.merci_reservation_date_value2) as span,
                fdfr.merci_reservation_items_target_id as room_id
              FROM node
                INNER JOIN node__field_reservation_status fdfrs ON fdfrs.entity_id=node.nid
                LEFT JOIN node__merci_reservation_date fdfd ON fdfd.entity_id = node.nid
                LEFT JOIN node__merci_reservation_items fdfr ON fdfr.entity_id = node.nid
              WHERE fdfd.merci_reservation_date_value > :start_date
                AND fdfd.merci_reservation_date_value2 < :end_date
                AND fdfr.merci_reservation_items_target_id = :nid
                AND fdfrs.field_reservation_status_value = :status_value
              ORDER BY fdfd.merci_reservation_date_value ASC';
  $result = db_query($query, array(':start_date' => $start_date, ':end_date' => $end_date, ':nid' => $use_nid, ':status_value' => $confirmed_status_value))->fetchAll();
      $reserved_room_times = array();
      $i = 0;
      foreach ($result as $row) {
        $d1 = new \DateTime();
        $d2 = new \DateTime();
        $d1->setTimestamp(strtotime($row->reservation_start_time));
        $start = $d1->modify($offset.' seconds');
        $d2->setTimestamp(strtotime($row->reservation_end_time));
        $end = $d2->modify($offset.' seconds');

        $reserved_room_times[] = array(
          'start_time' => $start->format("Y-m-d H:i:s"),
          'end_time' => $end->format("Y-m-d H:i:s"),
          'res_node' => $row->itemfinder,
          'tokenized_nid' => \Drupal\Component\Utility\Crypt::hmacBase64($row->itemfinder, '1245@hml'),
          'nid_status' => $row->merci_item_status,
          'span' => (int) $row->span / 15,
        );
      }
        $output .= '<div class="Row"><div class="reservation_time_th gridHeader Heading">' . $name . '</div>';
        $room_time_counter = 0;
        $border_counter = 1;
        $block_time_start = "07:00:15";
        $block_time_end = "07:15:00";
        while ($room_time_counter < 60){
          $i++;
          if ($border_counter % '4' == 0){
            $output .= '<div class="borderedCell Cell">';
          }
          else {
            $output .= '<div class="noBorderCell Cell">';
          }
          $output .= '<div class="reservation_time_div">';
          $output .= '<div class="reservation_time_cell_div" onclick="void(0)">';
          $is_available=0;
          $nid_status=0;
          $b_end=0;
          foreach ($reserved_room_times as $check_room_times){
            $reservation_start_time = $check_room_times['start_time'];
            $reservation_end_time = $check_room_times['end_time'];
            $reservation_node_link = $check_room_times['res_node'];
            if ($block_time_start >= date('H:i:s', strtotime($reservation_start_time)) && $block_time_end <= date('H:i:s', strtotime($reservation_end_time))){
                if ($block_time_end == date('H:i:s', strtotime($reservation_end_time))){
                  $b_end=1;
                }
                $is_available=1;
                $use_node_link=$reservation_node_link;
                $nid_status = $check_room_times['nid_status'];
            }
          }
          if ($is_available==1){
            if ($nid_status==2){
              $output .= '<a class="that" href="/node/'.$use_node_link.'"><div class="notAvailable_checkout" partof="'.$use_node_link.'" data-id="'.$use_nid.'" data-start="' . $block_time_start . '" data-end="' . $block_time_end . '" data-date="' . $start_date1 . '"><div style="visibility:hidden">x</div></div></a>';
            }
            else {
              if ($b_end==1){
                $output .= '<a class="that" href="/node/'.$use_node_link.'"><div class="notAvailable" partof="'.$use_node_link.'" style="border-right:2px solid #F2F2F2;" data-id="'.$use_nid.'" data-start="' . $block_time_start . '" data-end="' . $block_time_end . '" data-date="' . $start_date1 . '"><div style="visibility:hidden">x</div></div></a>';
              }
              else {
                $output .= '<a class="that" href="/node/'.$use_node_link.'"><div class="notAvailable" partof="'.$use_node_link.'" data-id="'.$use_nid.'" data-start="' . $block_time_start . '" data-end="' . $block_time_end . '" data-date="' . $start_date1 . '"><div style="visibility:hidden">x</div></div></a>';
              }
            }
          }
          else {
            if (abs($block_time_start) % 2) {
              $output .= '<a href="/node/add/merci_reservation/?nid='.$use_nid.'&date='.$start_date1.'&time='.date('H', strtotime($block_time_start)).'%3A'.date('i', strtotime($block_time_start)).'"><div class="Available darkSquare" style="margin-right:2px;" data-id="'.$use_nid.'" data-start="' . $block_time_start . '" data-end="' . $block_time_end . '" data-date="' . $start_date1 . '"><div style="visibility:hidden">x</div></div></a>';
            }
            else {
              $output .= '<a href="/node/add/merci_reservation/?nid='.$use_nid.'&date='.$start_date1.'&time='.date('H', strtotime($block_time_start)).'%3A'.date('i', strtotime($block_time_start)).'"><div class="Available lightSquare" style="margin-right:2px;" data-id="'.$use_nid.'" data-start="' . $block_time_start . '" data-end="' . $block_time_end . '" data-date="' . $start_date1 . '"><div style="visibility:hidden">x</div></div></a>';
            }
          }
          $output .= '</div></div></div>';
          $block_time_start = date('H:i:s', strtotime("+15 minutes", strtotime($block_time_start)));
          $block_time_end = date('H:i:s', strtotime("+15 minutes", strtotime($block_time_end)));
          $room_time_counter++;
          $border_counter++;
        }
        $output .= '</div><div class="Row">&nbsp;</div>';
      }
    $output .= '</div>';
    return $output;
  } //end function

  public function node_load_title($nid) {
    return db_query('SELECT title FROM node_field_data WHERE nid = :nid', array(':nid' => $nid))->fetchAll();
  }

} //end class
