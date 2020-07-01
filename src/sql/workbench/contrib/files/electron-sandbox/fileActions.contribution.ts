/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from 'vs/base/common/uri';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IElectronService } from 'vs/platform/electron/electron-sandbox/electron';
import { KeybindingsRegistry, KeybindingWeight } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { revealResourcesInOS } from './fileCommands';

const REVEAL_IN_OS_COMMAND_ID = 'revealFileInOSSqlProj';

KeybindingsRegistry.registerCommandAndKeybindingRule({
	id: REVEAL_IN_OS_COMMAND_ID,
	weight: KeybindingWeight.WorkbenchContrib,
	when: undefined,
	handler: (accessor: ServicesAccessor, resource: URI) => {
		revealResourcesInOS(resource, accessor.get(IElectronService), accessor.get(INotificationService), accessor.get(IWorkspaceContextService));
	}
});
