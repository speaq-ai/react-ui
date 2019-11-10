import sacramentoRealEstate from "../../data/SacramentoRealEstate";
import earthquake from "../../data/Earthquake";
import nycAirbnb from "../../data/NYCAirbnb";
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
		SUCCESS_CLEAR: "Okay, let's remove that dataset.",
		SUCCESS_CHANGE_VIEW: "Alright, changing that for you now!",
	};

	// static resolution methods
	// returns -1 if bad dataset name
	static _resolveDataset(datasetName) {
		var datasetMap = {
			Earthquake: earthquake,
			"Sacramento real estate": sacramentoRealEstate,
			"New York Airbnb": nycAirbnb,
		};

		if (datasetName in datasetMap) {
			return datasetMap[datasetName]
		} else {
			return -1
		}
	}

	static _resolveField(field) {
		var fieldMap = {
			price: "price",
			beds: "beds",
			baths: "baths",
			year: "year",
			magnitude: "magnitude",
			depth: "depth",
			"availability per year": "availability_365",
			"host listing count": "calculated_host_listings_count",
			"reviews per month": "reviews_per_month",
			"number of reviews": "number_of_reviews",
			"minimum nights": "minimum_nights",
		};
		return fieldMap[field];
	}

	updateKepler(keplerGl) {
		this._keplerGl = keplerGl;
	}

	// validation helper methods

	// get all datasets which are currently loaded in the kepler instance - not all that
	// could be loaded.
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
			return dataset.fields.find(f => f.name == ActionProcessor._resolveField(field)) ? true : false;
		} else {
			return false;
		}
	}

	async _executeOnDataset(action, dataset, ...args) {
		if (!this._validateDatasetExists(dataset)) {
			return [ActionProcessor.RESPONSES.INVALID_DATASET];
		}

		if (dataset == "Everything") {
			var results = []

			for (const datasetObj of this._getAllDatasets()) {
				results.push(await action(datasetObj.id, ...args))
			}

			return results
		} else {
			return await action(dataset, ...args)
		}
	}

	process = async res => {
		const { ACTION_KEYS } = ActionProcessor;
		switch (res.action) {
			case ACTION_KEYS.ADD_FILTER:
				return await this._executeOnDataset(
					this._addFilter,
					res.variables.dataset_name,
					res.variables.filter_field,
					res.variables.sys_number,
					res.variables.filter_comparison)

			case ACTION_KEYS.LOAD_DATASET:
				return this._loadDataset(res.variables.dataset_name)

			case ACTION_KEYS.CLEAR:
				return await this._executeOnDataset(this._clearDataset, res.variables.dataset_name)

			case ACTION_KEYS.CHANGE_VIEW_MODE:
				return await this._executeOnDataset(this._changeViewMode, res.variables.dataset_name, res.variables.view_mode)

			case ACTION_KEYS.VIEW_ACTION:
				return await this._executeViewAction(res.variables.view_action);

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
	_addFilter = async (dataset, field, value, comparator) => {
		if (!this._validateField(dataset, field)) {
			return [ActionProcessor.RESPONSES.INVALID_FIELD(dataset)];
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

	_setGtFilter = async (filterId, value) => {
		this._dispatch(
			setFilter(filterId, "value", [value, Number.MAX_SAFE_INTEGER])
		);
	}

	_setLtFilter = async (filterId, value) => {
		this._dispatch(
			setFilter(filterId, "value", [Number.MIN_SAFE_INTEGER, value])
		);
	}

	_setEqFilter = async (filterId, value) => {
		this._dispatch(setFilter(filterId, "value", [value, value]));
	}

	_clearDataset = (dataset) => {
		this._dispatch(removeDataset(dataset));
		return [ActionProcessor.RESPONSES.SUCCESS_CLEAR];
	}

	_loadDataset(datasetName) {
		const data = ActionProcessor._resolveDataset(datasetName);

		if (data === -1) {
			return [ActionProcessor.RESPONSES.INVALID_DATASET]
		}

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

	_changeViewMode = (dataset, viewMode) => {
		const layers = this._keplerGl.foo.visState.layers;

		const layer = layers.find(l => l.config.dataId == dataset);

		switch (viewMode) {
			case 3: // Watson strips the D for some reason
			case "3D":
				this._dispatch(togglePerspective());
				break;
			case "cluster":
				this._dispatch(layerTypeChange(layer, "cluster"));
				break;
			case "point":
				this._dispatch(layerTypeChange(layer, "point"));
				break;
			case "grid":
				this._dispatch(layerTypeChange(layer, "grid"));
				break;
			case "hexbin":
				this._dispatch(layerTypeChange(layer, "hexagon"));
				break;
			case "heatmap":
				this._dispatch(layerTypeChange(layer, "heatmap"));
				break;
		}

		return [ActionProcessor.RESPONSES.SUCCESS_CHANGE_VIEW];
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
