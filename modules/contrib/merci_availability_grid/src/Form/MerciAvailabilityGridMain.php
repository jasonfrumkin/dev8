<?php
/**
 * @file
 * Contains \Drupal\merci_availability_grid\Form\MerciAvailabilityGridMain.
 */
namespace Drupal\merci_availability_grid\Form;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Component\Utility\UrlHelper;
use Drupal\Core\Url;
use Symfony\Component\HttpFoundation\Response;
use Drupal\Core\Form\FormState;

/**
 * Contribute form.
 */
class MerciAvailabilityGridMain extends FormBase
{
    /**
   * {@inheritdoc}
   */
    public function getFormId()
    {
        return 'merci_availability_grid_main';
    }
    /**
   * {@inheritdoc}
   */
    public function buildForm(array $form, FormStateInterface $form_state)
    {
        /**
   * Generates the form for the availability page.
   */
        $tempstore = \Drupal::service('user.private_tempstore')->get('merci_availability_grid');
        $start_date = $tempstore->get('get_start_date');

        if(!$start_date) {
            $start_date = date('Y-m-d H:i:s');
        }
        $config = \Drupal::config('merci_availability_grid.settings');
        //$group_selection = $tempstore->get('group_entity');
        $group_selection = $config->get('inventory_entity');
        $room_selection = $tempstore->get('get_room_selection');

        $resource_nodes = \Drupal::entityTypeManager()->getStorage('node')->loadByProperties(['type' => $config->get('inventory_entity')]);

        foreach ($resource_nodes as $item) {
            $options[$item->id()] = $item->getTitle();
        }
        asort($options);
        $terms = node_type_get_names();
        $terms = $config->get('inventory_entity');
        foreach($terms as $term => $value) {
            if($value !== 0) {
                $groups[$term] = $value;
            }
        }
        asort($groups);

        $form['group_entity'] = array(
        '#type' => 'checkboxes',
        '#required' => true,
        '#title' =>'Select Inventory Group',
        '#options' => $groups,
        '#default_value' => $group_selection,
        );
        $form['merci_item_nid'] = array(
        '#type' => 'checkboxes',
        '#title' => 'Select a Room',
        '#options' => $options,
        '#default_value' => $room_selection,
        '#required' => true,
        );
        $form['start_date'] = array(
        '#type' => 'date',
        '#title' => 'Start Date',
        '#default_value' => $start_date,
        '#required' => true,
        );
        $form['submit'] = array(
        '#type' => 'submit',
        '#value' => t('Check Availability'),
        );
        return $form;
    }

    /**
   * {@inheritdoc}
   */
    public function submitForm(array &$form, FormStateInterface $form_state)
    {
        $checked = array();
        foreach($form_state->getValue('merci_item_nid') as $key => $val) {
            if($val >= 1) { $checked[$key] = $val;
            }
        }
        $tempstore = \Drupal::service('user.private_tempstore')->get('merci_availability_grid');
        $tempstore->set('get_room_selection', $checked);
        $tempstore->set('get_start_date', $form_state->getValue('start_date'));
        $tempstore->set('group_entity', $form_state->getValue('group_entity'));
        $form_state->setRebuild();
    }

} //end class
