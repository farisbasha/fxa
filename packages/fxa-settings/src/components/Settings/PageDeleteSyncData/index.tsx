/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { SETTINGS_PATH } from '../../../constants';
import { useNavigateWithQuery } from '../../../lib/hooks';
import { usePageViewEvent } from '../../../lib/metrics';
import { MfaReason } from '../../../lib/types';
import { AttachedClient, useAccount, useFtlMsgResolver } from '../../../models';
import { MfaGuard } from '../MfaGuard';
import FlowDeleteSyncDataConfirmPwd from './FlowDeleteSyncDataConfirmPwd';
import FlowDeleteSyncDataDevices, {
  SyncDevice,
} from './FlowDeleteSyncDataDevices';

export const viewName = 'settings.delete-sync-data';
export const DELETE_SYNC_DATA_PATH = `${SETTINGS_PATH}/delete_sync_data`;

/** Devices that hold the Sync key, in the shape the device step renders. */
export const getSyncDevices = (clients: AttachedClient[]): SyncDevice[] =>
  clients.flatMap(
    ({ deviceId, name, deviceType, isCurrentSession, isSyncCapable }) =>
      deviceId && isSyncCapable
        ? [{ deviceId, name, deviceType, isCurrentSession }]
        : []
  );

export const MfaGuardPageDeleteSyncData = () => (
  <MfaGuard requiredScope="sync_data" reason={MfaReason.deleteSyncData}>
    <PageDeleteSyncData />
  </MfaGuard>
);

export type PageDeleteSyncDataProps = {
  /** Defaults to the account's sync-capable attached clients. */
  devices?: SyncDevice[];
  /** Lets a story start on the device step. */
  initialStep?: 1 | 2;
  /** Receives the ids of the devices the user chose to sign out. The delete call is wired in FXA-14947. */
  onConfirm?: (signOutDeviceIds: string[]) => void;
};

export const PageDeleteSyncData = ({
  devices,
  initialStep = 1,
  onConfirm = () => {},
}: PageDeleteSyncDataProps) => {
  usePageViewEvent(viewName);
  const account = useAccount();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();
  const [currentStep, setCurrentStep] = useState<1 | 2>(initialStep);

  const syncDevices = devices ?? getSyncDevices(account.attachedClients);

  const localizedPageTitle = ftlMsgResolver.getMsg(
    'delete-sync-data-page-title',
    'Delete synced data'
  );
  const localizedBackButtonTitle = ftlMsgResolver.getMsg(
    'delete-sync-data-back-button-title',
    'Back to settings'
  );

  const goHome = () =>
    navigateWithQuery(`${SETTINGS_PATH}#data-collection`, { replace: true });

  const sharedStepProps = {
    localizedBackButtonTitle,
    localizedPageTitle,
    viewName,
  };

  return currentStep === 1 ? (
    <FlowDeleteSyncDataConfirmPwd
      {...sharedStepProps}
      navigateBackward={goHome}
      navigateForward={() => setCurrentStep(2)}
    />
  ) : (
    <FlowDeleteSyncDataDevices
      {...sharedStepProps}
      devices={syncDevices}
      navigateBackward={() => setCurrentStep(1)}
      onCancel={goHome}
      {...{ onConfirm }}
    />
  );
};

export default PageDeleteSyncData;
