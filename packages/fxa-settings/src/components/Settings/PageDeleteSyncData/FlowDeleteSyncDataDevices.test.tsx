/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../models/mocks';
import { FlowDeleteSyncDataDevices } from './FlowDeleteSyncDataDevices';
import { MOCK_SYNC_DEVICES } from '../DataCollection/mocks';

const renderStep = () => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  renderWithRouter(
    <FlowDeleteSyncDataDevices
      devices={MOCK_SYNC_DEVICES}
      localizedBackButtonTitle="Back to settings"
      localizedPageTitle="Delete synced data"
      navigateBackward={jest.fn()}
      viewName="test"
      {...{ onCancel, onConfirm }}
    />
  );
  return { onConfirm, onCancel, user: userEvent.setup() };
};

describe('FlowDeleteSyncDataDevices', () => {
  it('starts with no devices selected and deletes without signing out', async () => {
    const { onConfirm, user } = renderStep();

    expect(
      screen.getByRole('checkbox', {
        name: 'Sign out of Firefox on all my devices (3)',
      })
    ).not.toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledWith([]);
  });

  it('signs out the devices the user checks', async () => {
    const { onConfirm, user } = renderStep();

    await user.click(screen.getByRole('button', { name: 'Show devices' }));
    screen.getByText('Laurel’s MacBook Pro (this device)');
    const workLaptop = screen.getByRole('checkbox', { name: 'Work laptop' });
    expect(workLaptop).toHaveAccessibleDescription('Stay signed in');

    await user.click(workLaptop);
    expect(workLaptop).toHaveAccessibleDescription('Sign out');
    expect(
      screen.getByRole('checkbox', {
        name: 'Sign out of Firefox on all my devices (3)',
      })
    ).toHaveProperty('indeterminate', true);

    await user.click(
      screen.getByRole('button', { name: 'Delete and sign out' })
    );
    expect(onConfirm).toHaveBeenCalledWith([MOCK_SYNC_DEVICES[2].deviceId]);
  });

  it('selects every device from the sign-out-all checkbox', async () => {
    const { onConfirm, user } = renderStep();

    await user.click(
      screen.getByRole('checkbox', {
        name: 'Sign out of Firefox on all my devices (3)',
      })
    );
    await user.click(
      screen.getByRole('button', { name: 'Delete and sign out' })
    );
    expect(onConfirm).toHaveBeenCalledWith(
      MOCK_SYNC_DEVICES.map((d) => d.deviceId)
    );
  });

  it('cancels without confirming', async () => {
    const { onConfirm, onCancel, user } = renderStep();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
