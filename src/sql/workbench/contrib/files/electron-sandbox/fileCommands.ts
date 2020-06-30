/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from 'vs/base/common/uri';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IElectronService } from 'vs/platform/electron/electron-sandbox/electron';

// Commands

export function revealResourcesInOS(resource: URI, electronService: IElectronService, notificationService: INotificationService, workspaceContextService: IWorkspaceContextService): void {
	electronService.showItemInFolder(resource.fsPath);
}
