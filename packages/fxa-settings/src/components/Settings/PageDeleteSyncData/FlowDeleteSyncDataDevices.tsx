/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { FtlMsg } from 'fxa-react/lib/utils';
import { AttachedClient, useFtlMsgResolver } from '../../../models';
import { ReactComponent as DesktopIcon } from '../ConnectedServices/desktop.svg';
import { ReactComponent as MobileIcon } from '../ConnectedServices/mobile.svg';
import { ReactComponent as TabletIcon } from '../ConnectedServices/tablet.svg';
import { ReactComponent as Chevron } from '../../ResetPasswordWarning/chevron.svg';
import FlowContainer from '../FlowContainer';
import ProgressBar from '../ProgressBar';

export type SyncDevice = Pick<
  AttachedClient,
  'name' | 'deviceType' | 'isCurrentSession'
> & { deviceId: string };

export type FlowDeleteSyncDataDevicesProps = {
  devices: SyncDevice[];
  localizedBackButtonTitle: string;
  localizedPageTitle: string;
  navigateBackward: () => void;
  onCancel: () => void;
  /** `signOutDeviceIds` is empty unless the user checked devices. */
  onConfirm: (signOutDeviceIds: string[]) => void;
  viewName: string;
};

const DeviceIcon = ({ name, deviceType }: SyncDevice) => {
  const className = 'w-5 h-4 shrink-0 text-default';
  if ((name || '').toLowerCase().includes('ipad') || deviceType === 'tablet') {
    return <TabletIcon {...{ className }} aria-hidden />;
  }
  if (deviceType === 'mobile') {
    return <MobileIcon {...{ className }} aria-hidden />;
  }
  return <DesktopIcon {...{ className }} aria-hidden />;
};

const DeviceName = ({ name, isCurrentSession }: SyncDevice) =>
  isCurrentSession ? (
    <FtlMsg id="delete-sync-data-this-device" vars={{ deviceName: name || '' }}>
      <span className="break-word">{`${name} (this device)`}</span>
    </FtlMsg>
  ) : (
    <span className="break-word">{name}</span>
  );

const rowClassName =
  'flex items-center gap-3 px-4 py-3 border-t first:border-t-0 border-default nova:border-deemphasized';

const checkboxClassName =
  'w-4 h-4 shrink-0 cursor-pointer accent-blue-500 nova:accent-[var(--color-accent-primary)]';

export const FlowDeleteSyncDataDevices = ({
  devices,
  localizedBackButtonTitle,
  localizedPageTitle,
  navigateBackward,
  onCancel,
  onConfirm,
}: FlowDeleteSyncDataDevicesProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const [expanded, setExpanded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);

  const allSelected = devices.length > 0 && selectedIds.size === devices.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const toggleAll = () =>
    setSelectedIds(
      allSelected ? new Set() : new Set(devices.map((d) => d.deviceId))
    );

  const toggleDevice = (deviceId: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (!next.delete(deviceId)) next.add(deviceId);
      return next;
    });

  return (
    <FlowContainer
      title={localizedPageTitle}
      onBackButtonClick={navigateBackward}
      {...{ localizedBackButtonTitle }}
    >
      <div className="w-full flex flex-col gap-4">
        <ProgressBar currentStep={2} numberOfSteps={2} />

        <FtlMsg id="delete-sync-data-heading">
          <h2 className="font-heading text-xl">Delete synced data?</h2>
        </FtlMsg>

        <FtlMsg id="delete-sync-data-content">
          <p>
            This deletes your synced data from Mozilla’s servers, not your
            devices. If syncing is on, your data may return to Mozilla’s
            servers. Sign out to stop syncing data.
          </p>
        </FtlMsg>

        <div className="border rounded-lg border-default nova:border-deemphasized nova:rounded-xl text-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <label className="flex flex-1 items-center gap-3 cursor-pointer">
              <input
                ref={selectAllRef}
                type="checkbox"
                className={checkboxClassName}
                checked={allSelected}
                onChange={toggleAll}
                data-testid="delete-sync-data-sign-out-all"
              />
              <FtlMsg
                id="delete-sync-data-sign-out-all"
                vars={{ count: devices.length }}
              >
                <span id="delete-sync-data-sign-out-all-label">{`Sign out of Firefox on all my devices (${devices.length})`}</span>
              </FtlMsg>
            </label>
            <button
              type="button"
              className="p-2 -me-2 rounded focus-visible-default"
              aria-expanded={expanded}
              aria-controls="delete-sync-data-device-list"
              title={ftlMsgResolver.getMsg(
                'delete-sync-data-show-devices',
                'Show devices'
              )}
              onClick={() => setExpanded(!expanded)}
              data-testid="delete-sync-data-expand"
            >
              <Chevron
                className={classNames(
                  'w-3 h-2 transition-transform [&_path]:fill-current',
                  expanded && '-rotate-180'
                )}
                aria-hidden
              />
            </button>
          </div>
          {expanded && (
            <ul
              id="delete-sync-data-device-list"
              aria-labelledby="delete-sync-data-sign-out-all-label"
              className="border-t border-default nova:border-deemphasized bg-canvas"
              data-testid="delete-sync-data-device-list"
            >
              {devices.map((device) => {
                const checked = selectedIds.has(device.deviceId);
                const badgeId = `delete-sync-data-badge-${device.deviceId}`;
                return (
                  <li
                    key={device.deviceId}
                    className={classNames(rowClassName, 'ps-8')}
                  >
                    <label className="flex flex-1 min-w-0 items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className={checkboxClassName}
                        checked={checked}
                        onChange={() => toggleDevice(device.deviceId)}
                        aria-describedby={badgeId}
                        data-testid="delete-sync-data-sign-out-device"
                      />
                      <DeviceIcon {...device} />
                      <DeviceName {...device} />
                    </label>
                    {/* Both labels share one grid cell so the badge keeps the wider label's width. */}
                    <span className="grid shrink-0 justify-items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-grey-50 dark:bg-grey-600 nova:bg-deemphasized">
                      <FtlMsg id="delete-sync-data-sign-out-badge">
                        <span
                          id={checked ? badgeId : undefined}
                          aria-hidden={!checked}
                          className={classNames(
                            'col-start-1 row-start-1',
                            !checked && 'invisible'
                          )}
                        >
                          Sign out
                        </span>
                      </FtlMsg>
                      <FtlMsg id="delete-sync-data-stay-signed-in-badge">
                        <span
                          id={checked ? undefined : badgeId}
                          aria-hidden={checked}
                          className={classNames(
                            'col-start-1 row-start-1',
                            checked && 'invisible'
                          )}
                        >
                          Stay signed in
                        </span>
                      </FtlMsg>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-3 mt-2">
          <FtlMsg id="delete-sync-data-cancel">
            <button
              type="button"
              className="cta-neutral cta-base-p"
              onClick={onCancel}
            >
              Cancel
            </button>
          </FtlMsg>
          {selectedIds.size > 0 ? (
            <FtlMsg id="delete-sync-data-delete-and-sign-out">
              <button
                type="button"
                className="cta-caution cta-base-p"
                onClick={() => onConfirm(Array.from(selectedIds))}
                data-testid="delete-sync-data-confirm"
              >
                Delete and sign out
              </button>
            </FtlMsg>
          ) : (
            <FtlMsg id="delete-sync-data-delete">
              <button
                type="button"
                className="cta-caution cta-base-p"
                onClick={() => onConfirm([])}
                data-testid="delete-sync-data-confirm"
              >
                Delete
              </button>
            </FtlMsg>
          )}
        </div>
      </div>
    </FlowContainer>
  );
};

export default FlowDeleteSyncDataDevices;
