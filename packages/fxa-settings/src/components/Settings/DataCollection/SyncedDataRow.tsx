/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { FtlMsg } from 'fxa-react/lib/utils';
import UnitRow from '../UnitRow';
import { useFtlMsgResolver } from '../../../models';
import { useNavigateWithQuery } from '../../../lib/hooks';
import { firefox } from '../../../lib/channels/firefox';
import { DELETE_SYNC_DATA_PATH } from '../PageDeleteSyncData';
import { SyncDevice } from '../PageDeleteSyncData/FlowDeleteSyncDataDevices';

export type SyncedDataRowProps = {
  /** Sync-capable devices. The parent hides the row when there are none. */
  devices: SyncDevice[];
  /** True in Firefox Desktop, where the `fxaccounts:sync_preferences` web channel message opens about:preferences#sync. */
  canOpenSyncPreferences: boolean;
};

export const SyncedDataRow = ({
  canOpenSyncPreferences,
}: SyncedDataRowProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();

  const accountAndSync = canOpenSyncPreferences ? (
    <button
      type="button"
      className="link-blue underline"
      onClick={() => firefox.fxaOpenSyncPreferences()}
      data-testid="synced-data-open-sync-preferences"
    >
      Account and sync
    </button>
  ) : (
    <span>Account and sync</span>
  );

  return (
    <UnitRow
      header={ftlMsgResolver.getMsg('dc-subheader-synced-data', 'Synced data')}
      hideHeaderValue
      actionContent={
        // UnitRow's own CTA wraps and overflows next to long row text.
        <FtlMsg id="dc-synced-data-delete-button">
          <button
            type="button"
            // Nova's 16px comes from UnitRow's content padding.
            className="cta-neutral cta-base-p whitespace-nowrap @mobileLandscape/unitRow:ms-4 nova:@mobileLandscape/unitRow:ms-0"
            onClick={() => navigateWithQuery(DELETE_SYNC_DATA_PATH)}
            data-testid="synced-data-delete"
          >
            Delete synced data
          </button>
        </FtlMsg>
      }
    >
      <p>
        <FtlMsg id="dc-synced-data-content" elems={{ link: accountAndSync }}>
          <span>
            Delete synced data stored on Mozilla’s servers. This won’t delete
            data on your devices or turn off syncing. To manage what syncs on
            this device, go to {accountAndSync} in Firefox Settings.
          </span>
        </FtlMsg>{' '}
        <LinkExternal
          href="https://support.mozilla.org/kb/how-do-i-set-sync-my-computer"
          className="link-blue whitespace-nowrap"
          data-testid="link-external-synced-data"
        >
          <FtlMsg id="dc-learn-more">Learn more</FtlMsg>
        </LinkExternal>
      </p>
    </UnitRow>
  );
};

export default SyncedDataRow;
