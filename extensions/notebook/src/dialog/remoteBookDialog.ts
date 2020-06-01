/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import * as loc from '../common/localizedConstants';
import { RemoteBookController, IReleases } from '../book/remoteBookController';

function getRemoteLocationCategory(name: string): azdata.CategoryValue {
	if (name === 'GitHub') {
		return { name: name, displayName: loc.onGitHub };
	}
	return { name: name, displayName: loc.onSharedFile };
}

export class RemoteBookDialogModel {
	private _remoteTypes: azdata.CategoryValue[];
	private _controller: RemoteBookController;

	constructor(
	) {
		this._controller = new RemoteBookController();
	}

	public get remoteLocationCategories(): azdata.CategoryValue[] {
		if (!this._remoteTypes) {
			this._remoteTypes = [getRemoteLocationCategory('GitHub'), getRemoteLocationCategory('Shared File')];
		}
		return this._remoteTypes;
	}

	public async getReleases(url: string): Promise<IReleases[]> {
		let remotePath: URL;
		try {
			url = 'https://api.github.com/'.concat(url);
			remotePath = new URL(url);
			return this._controller.getReleases(remotePath);
		}
		catch (error) {
			throw error;
		}
	}

	public async downloadLocalCopy(url: URL, remoteLocation: string, release?: IReleases): Promise<string[]> {
		if (release) {
			return await this._controller.setRemoteBook(url, remoteLocation, release.zipURL, release.tarURL);
		}
		else {
			return await this._controller.setRemoteBook(url, remoteLocation);
		}
	}

	public openRemoteBook(book: string): void {
		this._controller.openRemoteBook(book);
	}

}

export class RemoteBookDialog {

	private dialog: azdata.window.Dialog;
	private view: azdata.ModelView;
	private formModel: azdata.FormContainer;
	private urlInputBox: azdata.InputBoxComponent;
	private remoteLocationDropdown: azdata.DropDownComponent;
	private remoteBookDropdown: azdata.DropDownComponent;
	private releaseDropdown: azdata.DropDownComponent;
	private releases: IReleases[];

	constructor(private model: RemoteBookDialogModel) {
	}

	public showDialog(): void {
		this.createDialog();
	}

	private createDialog(): void {
		this.dialog = azdata.window.createModelViewDialog(loc.openRemoteBook);
		this.dialog.registerContent(async view => {
			this.view = view;

			this.remoteLocationDropdown = this.view.modelBuilder.dropDown().withProperties({
				values: this.model.remoteLocationCategories,
				value: '',
				editable: false,
			}).component();

			this.remoteLocationDropdown.onValueChanged(e => this.onRemoteLocationChanged());

			this.urlInputBox = this.view.modelBuilder.inputBox()
				.withProperties<azdata.InputBoxProperties>({
					placeHolder: loc.url
				}).component();

			this.urlInputBox.onTextChanged(async () => await this.validate());

			this.remoteBookDropdown = this.view.modelBuilder.dropDown().withProperties({
				values: [],
				value: '',
			}).component();

			this.releaseDropdown = this.view.modelBuilder.dropDown().withProperties({
				values: [],
				value: '',
			}).component();

			this.releaseDropdown.updateCssStyles({
				display: 'none'
			});

			this.remoteBookDropdown.updateCssStyles({
				display: 'none'
			});

			this.formModel = this.view.modelBuilder.formContainer()
				.withFormItems([{
					components: [
						{
							component: this.remoteLocationDropdown,
							title: loc.location,
							required: true
						},
						{
							component: this.urlInputBox,
							title: loc.remoteBookUrl,
							required: true
						},
						{
							component: this.releaseDropdown,
							title: ''
						},
						{
							component: this.remoteBookDropdown,
							title: ''
						},
					],
					title: ''
				}]).withLayout({ width: '100%' }).component();
			await this.view.initializeModel(this.formModel);
			this.urlInputBox.focus();
		});
		let downloadButton = azdata.window.createButton('Download');
		downloadButton.onClick(async () => await this.download());
		this.dialog.customButtons = [];
		this.dialog.customButtons.push(downloadButton);
		this.dialog.okButton.onClick(async () => await this.openRemoteBook());
		this.dialog.okButton.label = loc.open;
		this.dialog.okButton.enabled = false;
		this.dialog.cancelButton.label = loc.cancel;
		azdata.window.openDialog(this.dialog);
	}

	private get remoteLocationValue(): string {
		return (<azdata.CategoryValue>this.remoteLocationDropdown.value).name;
	}

	private get remoteBookValue(): string {
		return this.remoteBookDropdown.value.toString();
	}

	private onRemoteLocationChanged(): void {
		let location = this.remoteLocationValue;
		if (this.releases !== undefined && location === 'GitHub') {
			this.releaseDropdown.updateCssStyles({
				display: 'block'
			});
		} else {
			this.releaseDropdown.updateCssStyles({
				display: 'none'
			});
		}
	}

	private async validate(): Promise<void> {
		let url = this.urlInputBox && this.urlInputBox.value;
		let location = this.remoteLocationValue;

		try {
			if (location === 'GitHub') {
				let releases = await this.model.getReleases(url);
				if (releases !== undefined && releases !== []) {
					this.releaseDropdown.updateCssStyles({
						display: 'block'
					});
					await this.fillReleasesDropdown(releases);
				}
			}
		}
		catch (error) {
			this.dialog.message = {
				text: (typeof error === 'string') ? error : error.message,
				level: azdata.window.MessageLevel.Error
			};
		}
	}

	private async download(): Promise<void> {
		let location = this.remoteLocationValue;
		this.dialog.customButtons[0].enabled = false;
		let books: string[] = [];
		try {
			if (location === 'GitHub') {
				let selected_release = this.releases.filter(release =>
					release.tag_name === this.releaseDropdown.value);
				books = await this.model.downloadLocalCopy(selected_release[0].remote_path, location, selected_release[0]);
			} else {
				let url = this.urlInputBox && this.urlInputBox.value;
				let newUrl = new URL(url);
				books = await this.model.downloadLocalCopy(newUrl, location);
			}
			if (books !== undefined && books.length > 0) {
				this.remoteBookDropdown.updateCssStyles({
					display: 'block'
				});
				this.remoteBookDropdown.updateProperties({
					values: books
				});
				this.dialog.okButton.enabled = true;
				this.dialog.message = {
					text: 'No Books available to open',
					level: azdata.window.MessageLevel.Information
				};
			}
		}
		catch (error) {
			this.dialog.message = {
				text: (typeof error === 'string') ? error : error.message,
				level: azdata.window.MessageLevel.Error
			};
		}
	}

	private async fillReleasesDropdown(releases: IReleases[]): Promise<void> {
		this.releases = releases;
		let versions: string[] = [];
		releases.forEach(release => {
			versions.push(release.tag_name);
		});

		this.releaseDropdown.updateProperties({
			values: versions
		});
	}

	private openRemoteBook(): void {
		this.model.openRemoteBook(this.remoteBookValue);
	}
}