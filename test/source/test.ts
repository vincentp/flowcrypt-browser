/* © 2016-2018 FlowCrypt Limited. Limitations apply. Contact human@flowcrypt.com */

import * as ava from 'ava';
import {BrowserHandle, BrowserPool, Semaphore} from './browser';
import {BrowserRecipe} from './tests/browser_recipe';
import {define_unit_tests} from './tests/tests/unit';
import {define_setup_tests} from './tests/tests/setup';
import {define_compose_tests} from './tests/tests/compose';
import {define_decrypt_tests} from './tests/tests/decrypt';
import {define_gmail_tests} from './tests/tests/gmail';
import {define_settings_tests} from './tests/tests/settings';

let browser_pool = new BrowserPool(5);
let global_browser_semaphore = new Semaphore(1);
let global_browser: BrowserHandle;

export let test_with_new_browser = (cb: (browser: BrowserHandle, t: ava.ExecutionContext<{}>) => Promise<void>): ava.Implementation<{}> => {
  return async (t: ava.ExecutionContext<{}>) => {
    await browser_pool.with_new_browser(cb, t);
    t.pass();
  };
};

export let test_with_semaphored_global_browser = (cb: (browser: BrowserHandle, t: ava.ExecutionContext<{}>) => Promise<void>): ava.Implementation<{}> => {
  return async (t: ava.ExecutionContext<{}>) => {
    await global_browser_semaphore.acquire();
    try {
      await cb(global_browser, t);
      t.pass();
    } finally {
      global_browser_semaphore.release();
    }
  };
};

ava.before('set up global browser', async t => {
  let browser = await browser_pool.new_browser_handle();
  await BrowserRecipe.set_up_flowcrypt_compatibility_account(browser);
  global_browser = browser;
  t.pass();
});

define_setup_tests(test_with_new_browser, test_with_semaphored_global_browser);
define_unit_tests(test_with_new_browser, test_with_semaphored_global_browser);
define_compose_tests(test_with_new_browser, test_with_semaphored_global_browser);
define_decrypt_tests(test_with_new_browser, test_with_semaphored_global_browser);
define_gmail_tests(test_with_new_browser, test_with_semaphored_global_browser);
define_settings_tests(test_with_new_browser, test_with_semaphored_global_browser);
