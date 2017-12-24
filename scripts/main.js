/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

/* eslint-env browser, es6 */

'use strict';

const applicationServerPublicKey = 'BIDVFIl9WITkDH7-3pBEmCHCYtsEtkJeUooweB_3-jasZBRDwMjaV305TiE6tyHB6vZD7paks3iT980_sVMv2jw';

const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

if('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker and Push Messaging supported.');

  navigator.serviceWorker.register('sw.js')
    .then(function(swReg) {
      console.log('Service worker is Registered ', swReg);
      swRegistration = swReg;

      initializeUI();
    })
    .catch(function(err) {
      console.log('Service Worker error ', err);
    })
} else {
  console.warn('Push meassaging is not supported.');
  pushButton.content = 'Push not supported';
}

function initializeUI() {

  pushButton.addEventListener('click', function() {
    pushButton.disabled = true;
    if(isSubscribed) {
      unsubscribeUser();
    } else {
      subscribeUser();
    }
  })

  swRegistration.pushManager.getSubscription()
    .then(function(subscription) {
      isSubscribed = !(subscription === null);
      
      if(isSubscribed) {
        console.log('User is subscribed');
      } else {
        console.log('User is NOT Subscribed.');
      }
    });
    
    updateBtn();
}

function updateBtn() {

  if(Notification.permission === 'denied') {
    pushButton.textContent = 'Push Messaging Blocked';
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  if(isSubscribed) {
    pushButton.textContent = 'Disable push messaging';
  } else {
    pushButton.textContent = 'Enable push messaging';
  }

  pushButton.disabled = false;
}

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(function(subscription) {
    console.log('User is subscribed.');

    updateSubscriptionOnServer(subscription);

    isSubscribed = true;

    updateBtn();
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

function updateSubscriptionOnServer(subscription) {
  // TODO: Send subscription to application server

  const subscriptionJson = document.querySelector('.js-subscription-json');
  const subscriptionDetails =
    document.querySelector('.js-subscription-details');

  if (subscription) {
    subscriptionJson.textContent = JSON.stringify(subscription);
    subscriptionDetails.classList.remove('is-invisible');
  } else {
    subscriptionDetails.classList.add('is-invisible');
  }
}

function unsubscribeUser() {
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    if (subscription) {
      return subscription.unsubscribe();
    }
  })
  .catch(function(error) {
    console.log('Error unsubscribing', error);
  })
  .then(function() {
    updateSubscriptionOnServer(null);

    console.log('User is unsubscribed.');
    isSubscribed = false;

    updateBtn();
  });
}