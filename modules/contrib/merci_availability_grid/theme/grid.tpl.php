<?php
/**
 * @file
 * grid.tpl.php
 */
if (!isset($_SESSION['get_start_date'])) {
    if ($_POST['start_date']['month'] > 0) {
        $get_start_date = date('Y-m-d', mktime(0, 0, 0, $_POST['start_date']['month'], $_POST['start_date']['day'], $_POST['start_date']['year']));
        $get_end_date = date('Y-m-d', mktime(0, 0, 0, $_POST['start_date']['month'], $_POST['start_date']['day'], $_POST['start_date']['year']));
    }
    else {
        $get_start_date=date("Y-m-d");
        $get_end_date=date("Y-m-d");
    }
    $display_date=date('n-d-Y', strtotime("-1 day", strtotime($get_start_date)));
    $start_date=date("Y-m-d", strtotime($get_start_date))." 05:00:01";
    $start_date1=date("Y-m-d", strtotime($get_start_date));
    $end_date=date("Y-m-d", strtotime("+1 day", strtotime($get_end_date)))." 04:59:59";
    $get_group_selection = $_POST['group_entity'];
    $inventory_type = $_POST['inventory_entity'];
    $res_type = $_POST['reservation_entity'];
    $fields = field_info_instances("node", $res_type);

}
else {
    $get_start_date = date('Y-m-d', strtotime($_SESSION['get_start_date']));
    $display_date=date('n-d-Y', strtotime("-1 day", strtotime($_SESSION['get_start_date'])));
    $selection_name = $_SESSION['selection_name'];
    $get_group_selection = $_SESSION['get_group_selection'];
    $start_date=date("Y-m-d", strtotime($get_start_date))." 05:00:01";
    $start_date1=date("Y-m-d", strtotime($get_start_date));
    $end_date=date("Y-m-d", strtotime("+1 day", strtotime($get_start_date)))." 04:59:59";
    $inventory_type = $_SESSION['inventory_entity'];
    $res_type = $_SESSION['reservation_entity'];
    $fields = field_info_instances("node", $res_type);
}
$ifdst = date('I', strtotime($start_date));
if ($ifdst==0) {
    $time_off_set = 6;
}
else {
    $time_off_set = 5;
}
$get_room_selection = $_SESSION['get_room_selection'];

// $reservation_entity = variable_get('reservation_entity', 0);
   $reservation_entity = \Drupal::state()->get('reservation_entity') ?: 0;

// $reservation_reference = variable_get('reservation_reference', 0);
   $reservation_reference = \Drupal::state()->get('reservation_reference') ?: 0;


// $statusVar = variable_get('reservation_status', 0);
   $statusVar = \Drupal::state()->get('reservation_status') ?: 0;


// $dateVar = variable_get('reservation_date', 0);
   $dateVar = \Drupal::state()->get('reservation_date') ?: 0;

$options = get_default_options($reservation_entity);
$opt = $options[$reservation_reference];
$date = $options[$dateVar];
$status = $options[$statusVar];
?>
<div class="merci-availability-key" style="float:left;height:30px;width:100%;">
<span class="available" style="background-color:#83D783; display:inline-block; height:1.2em; width:1.2em;"></span> = Available
<span class="unavailable" style="margin-left:7px; background-color:#c99 !important; display:inline-block; height:1.2em; width:1.2em;"></span> = Reserved
<span class="notAvailable_checkout" style="margin-left:7px; background-color:#C55B5B; display: inline-block; height: 1.2em; width: 1.2em;"></span> = In Use
</div>
<table border="0" style="margin:0px;padding:0px 0px 15px 0px;border-spacing:0px;clear:both;" id="selectable">
 <thead><tr>
  <th d="roomID" class="header headerSortDown"></th>
      <th colspan="4" class="header">7am </th>
      <th colspan="4" class="header">8am </th>
      <th colspan="4" class="header">9am </th>
      <th colspan="4" class="header">10am </th>
      <th colspan="4" class="header">11am </th>
      <th colspan="4" class="header">12pm </th>
      <th colspan="4" class="header">1pm </th>
      <th colspan="4" class="header">2pm </th>
      <th colspan="4" class="header">3pm </th>
      <th colspan="4" class="header">4pm </th>
      <th colspan="4" class="header">5pm </th>
      <th colspan="4" class="header">6pm </th>
      <th colspan="4" class="header">7pm </th>
      <th colspan="4" class="header">8pm </th>
      <th colspan="4" class="header">9pm </th>
    </tr></thead>
    <?
    $group_nodes = taxonomy_select_nodes($get_group_selection);
    if(!$group_nodes[0]) { unset($group_nodes); }
    if(is_array($group_nodes)){
      $finalNodes = $group_nodes;
    }
    elseif(!isset($get_room_selection) || !is_array($get_room_selection)) {
      $finalNodes['name'] = 1;
    }
    else{
      $finalNodes = $get_room_selection;
    }
  foreach($finalNodes as $name => $room) {
    if(!$room[0]) { $room = 1; }
    $names = node_load_title($room);
    foreach ($names as $nam) {
         $name = $nam->title;
    }
    $use_nid=$room;
    $use_margin=$room;
    $query = "
SELECT
  node.nid as itemfinder,
  fdfrs.".$status."_value as merci_item_status,
  fdfd.".$date."_value as reservation_start_time,
  DATE_SUB(fdfd.".$date."_value, INTERVAL 5 HOUR) as reservation_start_time,
  DATE_SUB(fdfd.".$date."_value2, INTERVAL 5 HOUR) as reservation_end_time,
  fdfr.".$opt."_target_id as room_id
FROM node
  INNER JOIN field_data_".$status." fdfrs ON fdfrs.entity_id=node.nid
  LEFT JOIN field_data_".$date." fdfd ON fdfd.entity_id = node.nid
  LEFT JOIN field_data_".$opt." fdfr ON fdfr.entity_id = node.nid
WHERE fdfd.".$date."_value > :start_date
  AND fdfd.".$date."_value2 < :end_date
  AND fdfr.".$opt."_target_id = :nid
  AND fdfrs.".$status."_value > 0
ORDER BY fdfd.".$date."_value ASC";
    $result = db_query($query, array(':start_date' => $start_date, ':end_date' => $end_date, ':nid' => $use_nid));
      $reserved_room_times = array();
      foreach ($result as $row) {
        $reserved_room_times[] = array('start_time' => $row->reservation_start_time, 'end_time' => $row->reservation_end_time, 'res_node' => $row->itemfinder, 'nid_status' => $row->merci_item_status);
      }
        echo '<tr><th style="width:190px;text-align:left" class="reservation_time_th">' . $name . '</th>';
        $room_time_counter = 0;
        $border_counter = 1;
        $block_time_start = "07:00:15";
        $block_time_end = "07:15:00";
        while ($room_time_counter < 60){
          if ($border_counter % '4' == 0){
                  echo '<td style="border-right:2px black solid;margin:0px;padding:0px;border-spacing:0px" class="ui-widget-content">';
          }
          else {
                  echo '<td style="margin:0px;padding:0px;border-spacing:0px" class="ui-widget-content">';
          }

          echo '<div class="reservation_time_div">';
          echo '<div class="reservation_time_cell_div" onclick="void(0)">';

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
              echo '<a class="that" href="/node/'.$use_node_link.'"><div id="abc" class="notAvailable_checkout" style="margin-top:7px;margin-bottom:'.$use_margin.';width:14px" data-id="'.$use_node_link.'" data-start="' . $block_time_start . '" data-end="' . $block_time_end . '"><div style="visibility:hidden">x</div></div></a>';
            }
            else {
              if ($b_end==1){
                echo '<a class="that" href="/node/'.$use_node_link.'"><div id="abc" class="notAvailable" style="border-right:2px solid #F2F2F2;margin-top:7px;margin-bottom:'.$use_margin.';width:12px" data-id="'.$use_node_link.'" data-start="' . $block_time_start . '" data-end="' . $block_time_end . '"><div style="visibility:hidden">x</div></div></a>';
              }
              else {
                echo '<a class="that" href="/node/'.$use_node_link.'"><div id="abc" class="notAvailable" style="margin-top:7px;margin-bottom:'.$use_margin.';width:14px" data-id="'.$use_node_link.'" data-start="' . $block_time_start . '" data-end="' . $block_time_end . '"><div style="visibility:hidden">x</div></div></a>';
              }
            }
          }
          else {
            if (abs($block_time_start) % 2) {
              echo '<a href="/node/add/reservation/?nid='.$use_nid.'&date=2015-06-19&time='.date('H', strtotime($block_time_start)).'%3A'.date('i', strtotime($block_time_start)).'"><div id="abc" class="Available" style="margin-top:7px;margin-bottom:'.$use_margin.';margin-right:2px;opacity:.6;width:12px" data-id="'.$use_nid.'" data-start="' . $block_time_start . '" data-end="' . $block_time_end . '"><div style="visibility:hidden">x</div></div></a>';
            }
            else {
              echo '<a href="/node/add/reservation/?nid='.$use_nid.'&date=2015-06-19&time='.date('H', strtotime($block_time_start)).'%3A'.date('i', strtotime($block_time_start)).'"><div id="abc" class="Available" style="margin-top:7px;margin-bottom:'.$use_margin.';margin-right:2px;width:12px" data-id="'.$use_nid.'" data-start="' . $block_time_start . '" data-end="' . $block_time_end . '"><div style="visibility:hidden">x</div></div></a>';
            }
          }

          echo '</div></div></td>';

          $block_time_start = date('H:i:s', strtotime("+15 minutes", strtotime($block_time_start)));
          $block_time_end = date('H:i:s', strtotime("+15 minutes", strtotime($block_time_end)));
          $room_time_counter++;
          $border_counter++;
        }
        echo '</tr>';
      }
echo '</table>';
?>
<script>
(function($){
    arr = [];

    $('.that').mousedown(function(e) {
        e.stopPropagation();
    });

      $( "#selectable tbody tr" ).selectable({
        filter: ".Available",
        selected: function( event, ui ) {},
        stop: function( event, ui ) {}
    });

      $( "#selectable tbody tr" ).on( "selectableselected", function( event, ui ) {
        arr.push(ui);
      });

      $( "#selectable tbody tr" ).on( "selectablestop", function( event, ui ) {
        if (arr[0]) {
          var index;
          var date = '<?php echo $start_date1; ?>';
          console.log(date);
          var last = ((arr.length) - 1);
        var node = arr[0].selected.getAttribute('data-id');
        var start = arr[0].selected.getAttribute('data-start');
        if(arr[1]){
          var end = arr[last].selected.getAttribute('data-end');
        }
        else {
          var end ="";
        }
        window.location.href = "/node/add/reservation/?nid="+node+"&date="+date+"&time="+start+"&time2="+end;
      }
      else{
        //do nothing for now
      }
      });
})(jQuery);
</script>
