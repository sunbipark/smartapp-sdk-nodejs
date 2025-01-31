'use strict'

const SectionSetting = require('./section-setting.js')

module.exports = class EnumSetting extends SectionSetting {
	constructor(section, id) {
		super(section, id)
		this._type = 'ENUM'
		this._description = 'Tap to set'
	}

	/**
	 * @typedef GroupedOption
	 * @property {String} name The display name of this group of enum options. Max length 128 characters.
	 * @property {Array<Option>} options The enum options.
	 */

	/**
	 * @typedef Option
	 * @property {String} id The unique ID for this option. Max length 128 characters.
	 * @property {String} name The display name for this option. Max length 128 characters.
	 */

	/**
	 * Indicates if this enum setting can have multiple values.
	 *
	 * @param {Boolean} value Multiple values
	 * @default false
	 * @returns {EnumSetting} Enum Setting instance
	 */
	multiple(value) {
		this._multiple = value
		return this
	}

	/**
	 * Indicates if this input should close on selection.
	 *
	 * @param {Boolean} value Close on selection value
	 * @default true
	 * @returns {EnumSetting} Enum Setting instance
	 */
	closeOnSelection(value) {
		this._closeOnSelection = value
		return this
	}

	i18nOptionKey(property) {
		return this._section._page.i18nKey(`settings.${this._id}.options.${property}.name`)
	}

	i18nOptionGroupKey(property) {
		return this._section._page.i18nKey(`settings.${this._id}.groups.${property}.name`)
	}

	i18nOptionGroupOptionKey(groupName, property) {
		return this._section._page.i18nKey(`settings.${this._id}.groups.${groupName}.options.${property}.name`)
	}

	/**
	 * Display the enum options as named groups.
	 *
	 * @param {Object.<string, Array<String>>|
	 *  Object.<String, Object.<String, String>>|
	 * 	Array<Object.<String, Object.<String, String>>>|
	 * 	Array<GroupedOption>} groups Array of grouped options
	 * @returns {EnumSetting} Enum Setting instance
	 * @example
	 * const groups = [{
	 *         name: 'First Group',
	 *         options: [{
	 *             id: 'option-001',
	 *             name: 'Option 1'
	 *         }]
	 *     },
	 *     {
	 *         name: 'Second Group',
	 *         options: [{
	 *             id: 'option-002',
	 *             name: 'Option 2'
	 *         }]
	 *     }
	 * ]
	 * @example
	 * section.enumSetting('id')
	 * 	   .groupedOptions({Colors: { 'red', 'blue', 'green'}})
	 * @example
	 * section.enumSetting('id')
	 * 	   .groupedOptions({Flavors: ['tart', 'salty', 'sweet']})
	 */
	groupedOptions(groups) {
		const values = []

		if (Array.isArray(groups)) {
			for (const group of groups) {
				if (group instanceof Object) {
					const groupName = group.name
					group.name = this._section._page.headers ? this.i18nOptionGroupKey(group.name) : group.name

					for (const option of group.options) {
						option.name = this._section._page.headers ? this.i18nOptionGroupOptionKey(groupName, option.name) : option.name
					}

					values.push(group)
				} else {
					throw new TypeError(`${typeof group} not valid for options group item`)
				}
			}
		} else if (groups instanceof Object) {
			for (const property in groups) {
				if (Object.prototype.hasOwnProperty.call(groups, property)) {
					const index = Object.keys(groups).indexOf(property)
					const group = {name: property, options: []}

					// Convert to i18nKey if necessary
					group.name = this._section._page.headers ? this.i18nOptionGroupKey(group.name) : group.name

					// Push group to output
					values.push(group)

					const propertyGroup = groups[property]
					if (Array.isArray(groups[property])) {
						values[index].options = propertyGroup.map(name => {
							return {
								id: name,
								name: this._section._page.headers ?
									this.i18nOptionGroupOptionKey(group.name, name) :
									name}
						})
					} else if (groups[property] instanceof Object) {
						for (const groupProperty in groups[property]) {
							if (Object.prototype.hasOwnProperty.call(groups[property], groupProperty)) {
								const option = {id: groupProperty, name: groups[property][groupProperty]}

								// Convert to i18nKey if necessary
								option.name = this._section._page.headers ?
									this.i18nOptionGroupOptionKey(group.name, groups[property][groupProperty]) :
									groups[property][groupProperty]

								// Push to output
								values[index].options.push(option)
							}
						}
					}
				}
			}
		} else {
			throw new TypeError(`${typeof groups} not valid for options group`)
		}

		this._groupedOptions = values
		return this
	}

	/**
	 * The enum options.
	 *
	 * @param {Array<String> | Object | Option | Array.<Option>} options Single or array of options
	 * @returns {EnumSetting} Enum Setting instance
	 * @example
	 * const options = [{
	 *         id: 'option-001',
	 *         name: 'Option 1'
	 *     },
	 *     {
	 *         id: 'option-002',
	 *         name: 'Option 2'
	 *     }
	 * ]
	 * section.enumSetting('id').options(options)
	 */
	options(options) {
		const values = []
		if (Array.isArray(options)) {
			for (let it of options) {
				if (typeof it === 'string' || it instanceof String) {
					it = {id: it, name: it}
				}

				// Convert to i18nKey if necessary
				it.name = this._section._page.headers ? this.i18nOptionKey(it.name) : it.name

				values.push(it)
			}
		} else if (options instanceof Object) {
			for (const property in options) {
				if (Object.prototype.hasOwnProperty.call(options, property)) {
					const option = {id: property, name: options[property]}

					// Convert to i18nKey if necessary
					option.name = this._section._page.headers ? this.i18nOptionKey(options[property]) : options[property]
					values.push(option)
				}
			}
		} else {
			throw new TypeError(`${typeof options} not valid for options`)
		}

		this._options = values
		return this
	}

	/**
	 * Indicates if this input should refresh configs after a change in value.
	 *
	 * @param {Boolean} value Submit on change value
	 * @default false
	 * @returns {EnumSetting} Enum Setting instance
	 */
	submitOnChange(value) {
		super._submitOnChange = value
		return this
	}

	/**
	 * Style of the setting.
	 *
	 * @param {('COMPLETE'|'ERROR'|'DEFAULT'|'DROPDOWN')} value Setting input style
	 * @returns {EnumSetting} Enum Setting instance
	 */
	style(value) {
		this._style = value
		return this
	}

	toJson() {
		const result = super.toJson()
		if (this._multiple) {
			result.multiple = this._multiple
		}

		if (this._closeOnSelection) {
			result.closeOnSelection = this._closeOnSelection
		}

		if (Array.isArray(this._groupedOptions)) {
			result.groupedOptions = this._groupedOptions
			for (let i = 0; i < this._groupedOptions.length; i++) {
				const group = this._groupedOptions[i]
				result.groupedOptions[i].name = this.translate(group.name)
				for (let g = 0; g < this._groupedOptions[i].options.length; g++) {
					const option = this._groupedOptions[i].options[g]
					result.groupedOptions[i].options[g].name = this.translate(option.name)
				}
			}
		}

		if (Array.isArray(this._options)) {
			result.options = this._options
			for (let i = 0; i < this._options.length; i++) {
				const it = this._options[i]
				result.options[i].name = this.translate(it.name)
			}
		}

		if (this._style) {
			result.style = this._style
		}

		return result
	}
}
