<?php
      $output = '';
      $output .= '<h3>' . t('About') . '</h3>';
      $output .= '<p>' . t('The Datetime Range module provides a Date field that stores start dates and times, as well as end dates and times. See the <a href=":field">Field module help</a> and the <a href=":field_ui">Field UI module help</a> pages for general information on fields and how to create and manage them. For more information, see the <a href=":datetime_do">online documentation for the Datetime Range module</a>.', array(':field' => \Drupal::url('help.page', array('name' => 'field')), ':field_ui' => (\Drupal::moduleHandler()->moduleExists('field_ui')) ? \Drupal::url('help.page', array('name' => 'field_ui')) : '#', ':datetime_do' => 'https://www.drupal.org/documentation/modules/datetime_range')) . '</p>';
      $output .= '<h3>' . t('Uses') . '</h3>';
      $output .= '<dl>';
      $output .= '<dt>' . t('Managing and displaying date fields') . '</dt>';
      $output .= '<dd>' . t('The <em>settings</em> and the <em>display</em> of the Date field can be configured separately. See the <a href=":field_ui">Field UI help</a> for more information on how to manage fields and their display.', array(':field_ui' => (\Drupal::moduleHandler()->moduleExists('field_ui')) ? \Drupal::url('help.page', array('name' => 'field_ui')) : '#')) . '</dd>';
      $output .= '<dt>' . t('Displaying dates') . '</dt>';
      $output .= '<dd>' . t('Dates can be displayed using the <em>Plain</em> or the <em>Default</em> formatter. The <em>Plain</em> formatter displays the date in the <a href="http://en.wikipedia.org/wiki/ISO_8601">ISO 8601</a> format. If you choose the <em>Default</em> formatter, you can choose a format from a predefined list that can be managed on the <a href=":date_format_list">Date and time formats</a> page.', array(':date_format_list' => \Drupal::url('entity.date_format.collection'))) . '</dd>';
      $output .= '</dl>';

      echo $output;
