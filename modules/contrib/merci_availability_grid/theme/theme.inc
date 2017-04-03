<?php

/**
 * @file
 * theme.inc file for MERCI AHML Pages module
 */

function template_preprocess_merci_availability_grid_availability_grid(&$variables) {
  $type = $variables['type'];
  $title = $variables['title'];
  $start = $variables['start'];
  $end = $variables['end'];
  $nid = $variables['nid'];
  $reservation_nid = NULL;
  $hours = array();
  if (\Drupal::currentUser()->hasPermission('create reservations outside hours of operation')) {
    // @FIXME
// // @FIXME
// // This looks like another module's variable. You'll need to rewrite this call
// // to ensure that it uses the correct configuration object.
// $adminhours = explode('-', variable_get('merci_hours_admin', '07:00-23:00'));


    for ($day = 0; $day < 7; $day++) {
      $hours[$day]['open'] = $adminhours[0];
      $hours[$day]['close'] = $adminhours[1];
    }
  }
  else {
    $hours = merci_load_hours_of_operation();
  }

  // Convert the start and end dates to the site timezone.
  $start = date_make_date($start, "UTC");
  $end = date_make_date($end, "UTC");
  // @FIXME
// // @FIXME
// // This looks like another module's variable. You'll need to rewrite this call
// // to ensure that it uses the correct configuration object.
// $timezone = variable_get('date_default_timezone_name', 'UTC');

  date_timezone_set($start, timezone_open($timezone));
  date_timezone_set($end, timezone_open($timezone));

  $start_day = date_format($start, 'w');
  $end_day = date_format($end, 'w');
  $start_date = $dates['value']['date'] = date_format($start, 'Y-m-d');
  $dates['value']['time'] = $hours[$start_day]['open'];
  $end_date = $dates['value2']['date'] = date_format($end, 'Y-m-d');
  $dates['value2']['time'] = $hours[$end_day]['close'];

  $dates = merci_convert_date_popup($dates, 'Y-m-d H:i');

  $start_mysql = $dates['value'];
  $end_mysql = $dates['value2'];

  $reservations = merci_load_reservations_for_node_in_timespan($nid, $type, $start_mysql, $end_mysql, $reservation_nid);

  $reservations_by_date = array();

  //for each day we are looking at.
  while ($start_date <= $end_date) {


    $day = date('w', strtotime($start_date));

    // loop through all the items.
    if (!empty($hours[$day])) {
      //$reservations_by_date[$start_date] = array();
      foreach ($reservations as $item => $values) {
        $reservations_by_date[$start_date][$item] = array();

        $time = strtotime($start_date . ' ' . $hours[$day]['open']);
        $close = strtotime($start_date . ' ' . $hours[$day]['close']);

        // all the reservations for that item.
        foreach ($values as $reservation) {

          // Convert to site timezone.
          $tz_start_date = date_make_date($reservation->field_merci_date_value, "UTC");
          $tz_end_date = date_make_date($reservation->field_merci_date_value2, "UTC");
          date_timezone_set($tz_start_date, timezone_open($timezone));
          date_timezone_set($tz_end_date, timezone_open($timezone));
          $tz_start_date = date_format($tz_start_date, "U");
          $tz_end_date = date_format($tz_end_date, "U");
          $tz_start_date = $tz_start_date < $close ? $tz_start_date : $close;
          $tz_end_date   = $tz_end_date < $close ? $tz_end_date : $close;
          $tz_start_date -= 15;
          if ($tz_end_date <= $time) {
            continue;
          }
          while ($time < $tz_start_date) {
            $reservations_by_date[$start_date][$item][date('H:i', $time)] = array(
              'class' => 'available',
              'data' => '',
            );
            $time += 15 * 60;
          }
          while ($time >= $tz_start_date && $time < $tz_end_date) {
            $reservations_by_date[$start_date][$item][date('H:i', $time)] = array(
              'class' => 'unavailable',
              'data' => $reservation->nid,
            );
            $time += 15 * 60;
          }
          $time = $tz_end_date;
        }
        while ($time < $close) {
          $reservations_by_date[$start_date][$item][date('H:i', $time)] = array(
            'class' => 'available',
            'data' => '',
          );
          $time += 15 * 60;
        }
      }
    }
    $start_date = date('Y-m-d', strtotime($start_date . ' +1 day'));
  }

  $variables['reservations_by_date'] = $reservations_by_date;

  $pretty_hours = array();

  foreach ($reservations_by_date as $date => $values) {
  //$reservations_by_date[$date]['title'] = 'test title.';
    $day = date('w', strtotime($date));
    $time = $hours[$day]['open'];
    while ($time < $hours[$day]['close']) {
      $pretty_hours[$date][] = date('ga', strtotime($time));
      // Don't overflow to next day.
      if ($time >= '23:00') break;
      $time = date('H:i', strtotime($time . ' +1 hour'));
    }
  }
  $variables['pretty_hours'] = $pretty_hours;

  $room_titles = array();
  foreach ($reservations_by_date as $reservations) {
    foreach ($reservations as $room_nid => $values) {
	  $room_titles[$room_nid]['nid'] = $room_nid;
	  $result = db_query("SELECT n.title, n.nid FROM {node} n WHERE n.nid = %d", $room_nid);
	  $this_title = db_fetch_object($result);
	  $room_titles[$room_nid]['title'] = $this_title->title;
	}
  }
  $variables['room_titles'] = $room_titles;
}
