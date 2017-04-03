<?php
/**
 * @file
 * Contains \Drupal\merci_availability_grid\Form\MerciAvailabilityGridAdminSettings.
 */

namespace Drupal\merci_availability_grid\Form;

use Symfony\Component\HttpFoundation\Request;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Element;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\ReplaceCommand;
use Drupal\Core\Entity;
use Drupal\field\FieldConfigInterface;

class MerciAvailabilityGridAdminSettings extends ConfigFormBase
{

    /**
   * {@inheritdoc}
   */
    public function getFormId()
    {
        return 'merci_availability_grid_admin_settings';
    }

    /**
   * {@inheritdoc}
   */
    protected function getEditableConfigNames()
    {
        return ['merci_availability_grid.settings'];
    }

    public function buildForm(array $form, FormStateInterface $form_state, Request $request = null)
    {
        $config = $this->config('merci_availability_grid.settings');
        $options_first = node_type_get_names();
        $form['merci_availability_grid_inventory'] = [

        '#type' => 'fieldset',
        '#title' => t('Merci Availability Grid Inventory Configuration'),
        ];

        $form['merci_availability_grid_inventory']['inventory_entity'] = array(
          '#type' => 'checkboxes',
          '#title' => t('Select Inventory Content Type(s)'),
          '#default_value' => $config->get('inventory_entity'),
          '#options' => $options_first,
          '#description' => t('Select content type that is being used to hold inventory for MERCI'),
        );


        $form['merci_availability_grid_reservations'] = [
        '#type' => 'fieldset',
        '#title' => t('Merci Availability Grid Reservation Configuration'),
        ];

        $form['merci_availability_grid_reservations']['reservation_entity'] = array(
         '#type' => 'select',
         '#title' => t('Select Reservation Content Type'),
         '#default_value' =>  $config->get('reservation_entity'),
         '#options' => $options_first,
         '#description' => t('Select content type that is being used to make reservations for MERCI'),
         '#required' => true,
        );

        $contentType = 'merci_reservation';
        $entityManager = \Drupal::service('entity_field.manager');
        $fields = [];
        if(!empty($contentType)) {
            $fields = array_filter(
                $entityManager->getFieldDefinitions('node', $contentType), function ($field_definition) {
                    return $field_definition instanceof FieldConfigInterface;
                }
            );
        }
        $count =0;
        foreach($fields as $fieldID => $field){
            $options[$count] = $fieldID;
            $count++;
        }
        $form['merci_availability_grid_reservations']['reservation_status'] = array(
         '#type' => 'select',
         '#title' => t('Select Reservation Status Field'),
         '#options' => $options,
         '#default_value' => $config->get('reservation_status'),
         '#description' => t('Select the field that holds the status for reservations.'),
         '#required' => true,
        );
        $form['merci_availability_grid_reservations']['reservation_date'] = array(
          '#type' => 'select',
          '#title' => t('Select Reservation Date Field'),
          '#options' => $options,
          '#default_value' => $config->get('reservation_date'),
          '#description' => t('Select the field that holds the date for reservations.'),
          '#required' => true,
        );
        $form['merci_availability_grid_reservations']['reservation_reference'] = array(
          '#type' => 'select',
          '#title' => t('Select The Inventory Entity Reference Field.'),
          '#options' => $options,
          '#default_value' => $config->get('reservation_reference'),
          '#description' => t('Select the field that holds the entity reference for inventory.'),
          '#required' => true,
        );
        $form['merci_availability_grid_reservations']['submit'] = array(
          '#type' => 'submit',
          '#value' => 'Save',
        );
        return $form;
    }

    public static function first_call($form, $form_state)
    {
        $form['merci_availability_grid_reservations']['reservation_status'];
    }

    public static function merci_availability_grid_field_reservation_change_ajax_callback(array &$form, FormStateInterface $form_state)
    {
        $response = new AjaxResponse();
        $contentType = $form_state->getValue('reservation_entity');
        $entityManager = \Drupal::service('entity.manager');
        $fields = [];
        if(!empty($contentType)) {
            $fields = array_filter(
                $entityManager->getFieldDefinitions('node', $contentType), function ($field_definition) {
                    return $field_definition instanceof FieldConfigInterface;
                }
            );
        }
        $count = 0;
        foreach($fields as $fieldID => $field){
            $optionVals .= '<option value="'.$count.'">'.$fieldID.'</option>';
            $count++;
        }
        $optionStatus = '<select data-drupal-selector="edit-reservation-status" aria-describedby="edit-reservation-status--description" id="edit-reservation-status" name="reservation_status" class="form-select required" required="required" aria-required="true">';
        $optionStatus .= $optionVals;
        $optionStatus .= '</select>';

        $optionDate = '<select data-drupal-selector="edit-reservation-date" aria-describedby="edit-reservation-date--description" id="edit-reservation-date" name="reservation_date" class="form-select required" required="required" aria-required="true">';
        $optionDate .= $optionVals;
        $optionDate .= '</select>';

        $optionInv = '<select data-drupal-selector="edit-reservation-reference" aria-describedby="edit-reservation-reference--description" id="edit-reservation-reference" name="reservation_reference" class="form-select required" required="required" aria-required="true">';
        $optionInv .= $optionVals;
        $optionInv .= '</select>';

        $response->addCommand(new ReplaceCommand('#edit-reservation-status', $optionStatus));
        $response->addCommand(new ReplaceCommand('#edit-reservation-date', $optionDate));
        $response->addCommand(new ReplaceCommand('#edit-reservation-reference', $optionInv));
        return $response;
    }

    /**
   * {@inheritdoc}
   */
    public function submitForm(array &$form, FormStateInterface $form_state)
    {
        $this->config('merci_availability_grid.settings')
            ->set('inventory_entity', $form_state->getValue('inventory_entity'))
            ->set('reservation_entity', $form_state->getValue('reservation_entity'))
            ->set('reservation_status', $form_state->getValue('reservation_status'))
            ->set('reservation_date', $form_state->getValue('reservation_date'))
            ->set('reservation_reference', $form_state->getValue('reservation_reference'))
            ->save();
        parent::submitForm($form, $form_state);
    }

}
