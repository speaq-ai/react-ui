import sacramentoRealEstate from "../../data/SacramentoRealEstate";
import earthquake from "../../data/Earthquake";
import { processCsvData } from "kepler.gl/processors";
import {
	addFilter,
	setFilter,
	addDataToMap,
	togglePerspective,
	layerTypeChange,
	updateMap,
	removeDataset,
} from "kepler.gl/actions";

export default class ActionProcessor {
	constructor(keplerGl, dispatch) {
		this._keplerGl = keplerGl;
		this._dispatch = dispatch;
	}

	static ACTION_KEYS = {
		ADD_FILTER: "AddFilter",
		LOAD_DATASET: "LoadData",
		CLEAR: "Clear",
		CHANGE_VIEW_MODE: "ChangeViewMode",
		VIEW_ACTION: "ViewAction",
		GOTO_ACTION: "GotoAction",
	};

	static RESPONSES = {
		INVALID_DATASET: "Sorry, we can't find that dataset.",
		INVALID_FIELD: dataset =>
			`That doesn't look like a valid field on the ${dataset} dataset.`,
		SUCCESS_FILTER: "Great, let's get that filter going.",
	};

	// static resolution methods
	static _resolveDataset(datasetName) {
		var datasetMap = {
			Earthquake: earthquake,
			"Sacramento real estate": sacramentoRealEstate,
		};

		return datasetMap[datasetName];
	}
	static _resolveField(field) {
		var fieldMap = {
			price: "price",
			beds: "beds",
			baths: "baths",
			year: "year",
			magnitude: "magnitude",
			depth: "depth",
		};
		return fieldMap[field];
	}

	updateKepler(keplerGl) {
		this._keplerGl = keplerGl;
	}

	// validation helper methods
	_getAllDatasets() {
		const { visState } = this._keplerGl.foo;
		return Object.values(visState.datasets);
	}

	_validateDatasetExists(datasetName) {
		const datasets = this._getAllDatasets();
		if (datasetName == "Everything") return true;
		return datasets.find(dataset => dataset.id == datasetName) ? true : false;
	}

	_validateField(datasetName, field) {
		const datasets = this._getAllDatasets();
		const dataset = datasets.find(dataset => dataset.id == datasetName);

		if (dataset) {
			return dataset.fields.find(f => f.name == field) ? true : false;
		} else {
			return false;
		}
	}

	process = async res => {
		const { ACTION_KEYS } = ActionProcessor;
		switch (res.action) {
			case ACTION_KEYS.ADD_FILTER:
				return await this._addFilter(
					res.variables.filter_field,
					res.variables.sys_number,
					res.variables.filter_comparison,
					res.variables.dataset_name
				);

			case ACTION_KEYS.LOAD_DATASET:
				return this._loadDataset(res.variables.dataset_name);

			case ACTION_KEYS.CLEAR:
				return this._clearDataset(res.variables.dataset_name);

			case ACTION_KEYS.CHANGE_VIEW_MODE:
				return this._changeViewMode(res.variables.view_mode);

			case ACTION_KEYS.VIEW_ACTION:
				return this._executeViewAction(res.variables.view_action);

			case ACTION_KEYS.GOTO_ACTION:
				return this._moveMap(
					res.variables.location[0],
					res.variables.location[1]
				);
			default:
				return [];
		}
	};

	/*
	 * ONLY WORKS FOR NUMERICS CURRENTLY
	 * Taking actions below.
	 * add filter takes the following arguments:
	 * field: filed name to create the filter for
	 * value: the value to use in the filter comparison
	 * comparator: one of {"gt", "lt", "eq"}
	 * dataset: TODO: lookup id if provided, else use
	 * most recently loaded dataset ID.
	 */
	async _addFilter(field, value, comparator, dataset) {
		if (dataset == "Everything") {
			const responses = [];
			this._getAllDatasets().forEach(async datasetObj => {
				responses.push(
					await this._addFilter(field, value, comparator, datasetObj.id)
				);
			});
			return responses;
		}

		// validation
		if (!this._validateDatasetExists(dataset)) {
			return [ActionProcessor.RESPONSES.INVALID_DATASET];
		} else if (!this._validateField(dataset, field)) {
			return [ActionProcessor.RESPONSES.INVALID_FIELD];
		}

		const { visState } = this._keplerGl.foo;
		const datasetId = dataset || Object.values(visState.datasets)[0].id;
		const filterId = visState.filters.length;

		await this._dispatch(addFilter(datasetId));
		await this._dispatch(
			setFilter(filterId, "name", ActionProcessor._resolveField(field))
		);

		switch (comparator) {
			case "greater than":
				await this._setGtFilter(filterId, value);
				break;
			case "less than":
				await this._setLtFilter(filterId, value);
				break;
			case "equal":
				await this._setEqFilter(filterId, value);
				break;
			default:
				break;
		}
		return [ActionProcessor.RESPONSES.SUCCESS_FILTER];
	}

	async _setGtFilter(filterId, value) {
		this._dispatch(
			setFilter(filterId, "value", [value, Number.MAX_SAFE_INTEGER])
		);
	}

	async _setLtFilter(filterId, value) {
		this._dispatch(
			setFilter(filterId, "value", [Number.MIN_SAFE_INTEGER, value])
		);
	}

	async _setEqFilter(filterId, value) {
		this._dispatch(setFilter(filterId, "value", [value, value]));
	}

	_clearDataset(dataset) {
		if (!this._validateDatasetExists(dataset)) {
			return [ActionProcessor.RESPONSES.INVALID_DATASET];
		}
		if (dataset != "Everything") {
			this._dispatch(removeDataset(dataset));
		} else {
			// Everything
			this._getAllDatasets().forEach(datasetObj => {
				this._dispatch(removeDataset(datasetObj.id));
			});
		}
		return [];
	}

	_loadDataset(datasetName) {
		const data = ActionProcessor._resolveDataset(datasetName);
		this._dispatch(
			addDataToMap({
				datasets: [
					{
						info: {
							label: datasetName,
							id: datasetName,
						},
						data: processCsvData(data),
					},
				],
			})
		);
		return [];
	}

	_changeViewMode(viewMode) {
		const layers = this._keplerGl.foo.visState.layers;

		switch (viewMode) {
			case 3: // Watson strips the D for some reason
			case "3D":
				this._dispatch(togglePerspective());
				break;
			case "cluster":
				this._dispatch(layerTypeChange(layers[0], "cluster"));
				break;
			case "point":
				this._dispatch(layerTypeChange(layers[0], "point"));
				break;
			case "grid":
				this._dispatch(layerTypeChange(layers[0], "grid"));
				break;
			case "hexbin":
				this._dispatch(layerTypeChange(layers[0], "hexagon"));
				break;
			case "heatmap":
				this._dispatch(layerTypeChange(layers[0], "heatmap"));
				break;
		}
		return [];
	}

	_executeViewAction(viewAction) {
		const mapState = this._keplerGl.foo.mapState;

		switch (viewAction) {
			case "in":
				this._dispatch(updateMap({ zoom: mapState.zoom * 1.1 }));
				break;
			case "out":
				this._dispatch(updateMap({ zoom: mapState.zoom * 0.9 }));
				break;
			case "up":
				this._dispatch(
					updateMap({ latitude: mapState.latitude + 1 / mapState.zoom })
				);
				break;
			case "down":
				this._dispatch(
					updateMap({ latitude: mapState.latitude - 1 / mapState.zoom })
				);
				break;
			case "right":
				this._dispatch(
					updateMap({ longitude: mapState.longitude + 1 / mapState.zoom })
				);
				break;
			case "left":
				this._dispatch(
					updateMap({ longitude: mapState.longitude - 1 / mapState.zoom })
				);
				break;
			case "enhance":
				this._dispatch(updateMap({ zoom: mapState.zoom * 1.5 }));
				break;
		}
		return [];
	}

	_moveMap(lat, long) {
		this._dispatch(updateMap({ latitude: lat, longitude: long }));
		return [];
	}
}
