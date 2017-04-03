<?php
/**
 * @file
 * Contains \Drupal\merci_availability_grid\Form\MerciAvailabilityGridNext.
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
class MerciAvailabilityGridPrev extends FormBase
{
    /**
   * {@inheritdoc}
   */
    public function getFormId() 
    {
        return 'merci_availability_grid_prev';
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
        if(null == $tempstore->get('get_start_date')) {
            $sdmo = date('Y-m-d', strtotime("-1 day", strtotime("now")));

        }
        else {
            $newDate = date('Y-m-d', strtotime($tempstore->get('get_start_date')));
            $d = new \DateTime($newDate);
            $d->modify('-1 day');
            $sdmo = $d->format('Y-m-d');
        }

        $form['start_date'] = array(
        '#type' => 'date',
        '#default_value' => $sdmo,
        '#value' => $sdmo,
        );
        $form['merci_item_nid'] = array(
        '#type' => 'hidden',
        '#value' => $tempstore->get('get_room_selection'),
        );
        $form['submit'] = array(
        '#type' => 'submit',
        '#value' => '< Previous Day',
        );
        return $form;
    }

    /**
   * {@inheritdoc}
   */
    public function submitForm(array &$form, FormStateInterface $form_state) 
    {
        $tempstore = \Drupal::service('user.private_tempstore')->get('merci_availability_grid');
        $tempstore->set('get_room_selection', $form_state->getValue('merci_item_nid'));
        $tempstore->set('get_start_date', $form_state->getValue('start_date'));
        $form_state->setRebuild();
    }

} //end class
