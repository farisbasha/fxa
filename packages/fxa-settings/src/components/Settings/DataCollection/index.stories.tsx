/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { DataCollection, DataCollectionProps } from '.';
import { Meta, StoryObj } from '@storybook/react';
import { withLocalization, withLocation } from 'fxa-react/lib/storybooks';
import { mockAppContext } from '../../../models/mocks';
import { Account, AppContext } from '../../../models';
import { MOCK_SYNC_DEVICES } from './mocks';

export default {
  title: 'Components/Settings/DataCollection',
  component: DataCollection,
  decorators: [withLocalization, withLocation()],
} as Meta;

const accountWithMetrics = {
  metricsEnabled: true,
} as unknown as Account;

const accountWithoutMetrics = {
  metricsEnabled: false,
} as unknown as Account;

const storyWithContext = (
  account: Partial<Account>,
  props: DataCollectionProps = {}
) => {
  const context = { account: account as Account };

  const story = () => (
    <AppContext.Provider value={mockAppContext(context)}>
      <DataCollection {...props} />
    </AppContext.Provider>
  );
  return story;
};

export const CollectionOn = storyWithContext(accountWithMetrics);

export const CollectionOff = storyWithContext(accountWithoutMetrics);

type Story = StoryObj<typeof DataCollection>;

export const SyncedData: Story = {
  name: 'Synced data row (Firefox Desktop)',
  render: storyWithContext(accountWithMetrics, {
    syncedData: { devices: MOCK_SYNC_DEVICES, canOpenSyncPreferences: true },
  }),
};

export const SyncedDataOutsideFirefoxDesktop: Story = {
  name: 'Synced data row (outside Firefox Desktop, no settings link)',
  render: storyWithContext(accountWithMetrics, {
    syncedData: { devices: MOCK_SYNC_DEVICES, canOpenSyncPreferences: false },
  }),
};
