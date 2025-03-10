// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-useless-escape */

export const simulateTemplate = `<!doctype html>
<html>
	<head>
		<style>
			body {
				font-family: ui-monospace, 'SFMono-Regular', 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
				font-size: 14px;
				min-width: 600px;
				margin: 0;
				padding: 0;
				background-color: rgb(39, 40, 34);
			}

			div#app {
				margin: 0 !important;
				padding: 0 !important;
			}

			.diff {
				padding: 2px 4px;
				border-radius: 4px;
				position: relative;
				color: white;
				line-height: 150%;
			}

			.diff > button {
				position: absolute;
				display: none;
				left: 50%;
				top: 50%;
				translate: -50% -50%;
				background: #fff;
				border: none;
				border-radius: 50%;
				padding: 10px;
				cursor: pointer;
				cursor: pointer;
				opacity: 80%;
				width: 40px;
				height: 40px;
			}

			.diff > button > img {
				width: 100%;
				height: 100%;
			}

			.diff > button:hover {
				opacity: 100%;
			}

			.diff:hover > button {
				display: block;
			}

			.diffWrap {
				position: relative;
				z-index: 1;
			}

			li:has(> span > span.diffWrap > span.diffRemove) > label {
				color: red !important;
				text-decoration: line-through;
				text-decoration-thickness: 1px;
			}

			.diffAdd {
				color: darkseagreen;
				display: inline-flex;
			}

			.diffRemove {
				text-decoration: line-through;
				text-decoration-thickness: 1px;
				color: red;
				display: inline-flex;
			}

			.diffUpdateFrom {
				text-decoration: line-through;
				text-decoration-thickness: 1px;
				color: red;
				display: inline-flex;
			}

			.diffUpdateTo {
				color: darkseagreen;
				display: inline-flex;
			}

			.diffUpdateArrow {
				color: #ccc;
			}

			.unchanged {
				color: #666;
			}

			.delta {
				color: #ccc;
				font-size: 12px;
				margin: 0 10px;
			}
		</style>
		<script src="https://unpkg.com/babel-standalone@6/babel.min.js" crossorigin></script>
		<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js" crossorigin></script>
		<script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
		<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
		<script src="https://unpkg.com/react-json-tree@0.18.0/lib/umd/react-json-tree.min.js" crossorigin></script>
	</head>

	<body>
		<div id="app"></div>
		<script type="text/babel">

			const left = <%= left %>;
			const delta = <%= delta %>;

			const expandFirstLevel = (keyName, data, level) => level <= 1;

			function stringifyAndShrink(val) {
				if (val == null) return 'null';
				if (typeof val === 'string') return val
				return JSON.stringify(val, null, 1);
			}

			const styling = (a) => {
				const className = Array.isArray(a) ? a : [a]
				return { className: className.join(' ') }
			}

			function valueRenderer(viewPartial) {
				return function (raw, value, ...keys) {
					const modifyPath = keys.reverse().join('.')
					const removePath = keys.map(x => Number.isInteger(parseInt(x)) ? '_' + x : x).join('.')
					const isDelta = _.has(delta, modifyPath) || _.has(delta, removePath)

					function renderSpan(name, body, raw) {
						return (
							<span key={name} {...styling(['diff', name])}>
								{body}
								{_.isObjectLike(raw) ? <button onClick={() => viewPartial({ [modifyPath]: raw })}><img src='data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KDTwhLS0gVXBsb2FkZWQgdG86IFNWRyBSZXBvLCB3d3cuc3ZncmVwby5jb20sIFRyYW5zZm9ybWVkIGJ5OiBTVkcgUmVwbyBNaXhlciBUb29scyAtLT4KPHN2ZyBmaWxsPSIjMDAwMDAwIiBoZWlnaHQ9IjY0cHgiIHdpZHRoPSI2NHB4IiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgMjQyLjEzMyAyNDIuMTMzIiB4bWw6c3BhY2U9InByZXNlcnZlIiBzdHJva2U9IiMwMDAwMDAiPgoNPGcgaWQ9IlNWR1JlcG9fYmdDYXJyaWVyIiBzdHJva2Utd2lkdGg9IjAiLz4KDTxnIGlkPSJTVkdSZXBvX3RyYWNlckNhcnJpZXIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgoNPGcgaWQ9IlNWR1JlcG9faWNvbkNhcnJpZXIiPiA8ZyBpZD0iWE1MSURfMjVfIj4gPHBhdGggaWQ9IlhNTElEXzI2XyIgZD0iTTg5LjI0NywxMzEuNjczbC00Ny43MzIsNDcuNzNsLTE1LjkwOS0xNS45MWMtNC4yOS00LjI5MS0xMC43NDItNS41NzItMTYuMzQ3LTMuMjUyIEMzLjY1NCwxNjIuNTYzLDAsMTY4LjAzMywwLDE3NC4xdjUzLjAzMmMwLDguMjg0LDYuNzE2LDE1LDE1LDE1bDUzLjAzMywwLjAwMWMwLjAwNy0wLjAwMSwwLjAxMi0wLjAwMSwwLjAxOSwwIGM4LjI4NSwwLDE1LTYuNzE2LDE1LTE1YzAtNC4zNzctMS44NzUtOC4zMTYtNC44NjUtMTEuMDU5bC0xNS40NTgtMTUuNDU4bDQ3LjczLTQ3LjcyOWM1Ljg1OC01Ljg1OCw1Ljg1OC0xNS4zNTUsMC0yMS4yMTMgQzEwNC42MDMsMTI1LjgxNSw5NS4xMDQsMTI1LjgxNiw4OS4yNDcsMTMxLjY3M3oiLz4gPHBhdGggaWQ9IlhNTElEXzI4XyIgZD0iTTIyNy4xMzMsMEgxNzQuMWMtNi4wNjcsMC0xMS41MzYsMy42NTUtMTMuODU4LDkuMjZjLTIuMzIxLDUuNjA1LTEuMDM4LDEyLjA1NywzLjI1MiwxNi4zNDdsMTUuOTExLDE1LjkxMSBsLTQ3LjcyOSw0Ny43M2MtNS44NTgsNS44NTgtNS44NTgsMTUuMzU1LDAsMjEuMjEzYzIuOTI5LDIuOTI5LDYuNzY4LDQuMzkzLDEwLjYwNiw0LjM5M2MzLjgzOSwwLDcuNjc4LTEuNDY0LDEwLjYwNi00LjM5NCBsNDcuNzMtNDcuNzNsMTUuOTA5LDE1LjkxYzIuODY5LDIuODcsNi43MDYsNC4zOTQsMTAuNjA5LDQuMzk0YzEuOTMzLDAsMy44ODItMC4zNzMsNS43MzctMS4xNDIgYzUuNjA1LTIuMzIyLDkuMjYtNy43OTIsOS4yNi0xMy44NThWMTVDMjQyLjEzMyw2LjcxNiwyMzUuNDE3LDAsMjI3LjEzMywweiIvPiA8L2c+IDwvZz4KDTwvc3ZnPg==' /></button> : null}
							</span>
						);
					}

					function renderDelta(value) {
						if (/^\d+(,\d+)*$/.test(value[0]) && /^\d+(,\d+)*$/.test(value[1])) {
							const oldValue = BigInt(value[0].replace(/,/g, ''))
							const newValue = BigInt(value[1].replace(/,/g, ''))
							if (oldValue > 0 && newValue > 0) {
								const delta = newValue - oldValue
								return (<span className="delta" >{delta > 0 ? '+' : ''}{delta.toLocaleString()}</span>)
							}
						}
					}

					if (isDelta && Array.isArray(value)) {
						switch (value.length) {
							case 0:
								return (
									<span {...styling('diffWrap')}>
										{renderSpan('diff', '[]')}
									</span>
								)
							case 1:
								return (
									<span {...styling('diffWrap')}>
										{renderSpan(
											'diffAdd',
											stringifyAndShrink(value[0]),
											value[0]
										)}
									</span>
								);
							case 2:
								return (
									<span {...styling('diffWrap')}>
										{renderSpan(
											'diffUpdateFrom',
											stringifyAndShrink(value[0]),
											value[0]
										)}
										{renderSpan('diffUpdateArrow', ' => ')}
										{renderSpan(
											'diffUpdateTo',
											stringifyAndShrink(value[1]),
											value[1]
										)}
										{renderDelta(value)}
									</span>
								);
							case 3:
								return (
									<span {...styling('diffWrap')}>
										{renderSpan('diffRemove', stringifyAndShrink(value[0]), value[0])}
									</span>
								);
						}
					}

					return (
						<span {...styling('diffWrap')}>
							{renderSpan('unchanged', stringifyAndShrink(value), value)}
						</span>
					);
				}
			};

			function prepareDelta(value) {
				if (value && value._t === 'a') {
					const res = {};
					for (const key in value) {
						if (key !== '_t') {
							if (key[0] === '_' && !value[key.substr(1)]) {
								res[key.substr(1)] = value[key];
							} else if (value['_' + key]) {
								res[key] = [value['_' + key][0], value[key][0]];
							} else if (!value['_' + key] && key[0] !== '_') {
								res[key] = value[key];
							}
						}
					}
					return res;
				}
				return value;
			}

			const theme = {
				scheme: 'monokai',
				base00: '#272822',
				base01: '#383830',
				base02: '#49483e',
				base03: '#75715e',
				base04: '#a59f85',
				base05: '#f8f8f2',
				base06: '#f5f4f1',
				base07: '#f9f8f5',
				base08: '#f92672',
				base09: '#fd971f',
				base0A: '#f4bf75',
				base0B: '#a6e22e',
				base0C: '#a1efe4',
				base0D: '#66d9ef',
				base0E: '#ae81ff',
				base0F: '#cc6633',
			};

			class App extends React.Component {
				constructor(props) {
					super(props);
					this.state = { showUnchanged: false, partial: null };
				}

				toggle = (e) => {
					this.setState(state => {
						return { ...state, showUnchanged: !state.showUnchanged }
					})
				}

				viewPartial = (value) => {
					this.setState(state => {
						return { ...state, partial: _.isEqual(state.partial, value) ? null : value }
					})
				}

				render() {
					return (
						<div>
							<div style={{ display: 'flex', flexDirection: 'row' }}>
								<div style={{ flex: 1, padding: '0 10px', overflow: 'hidden', overflowY: 'scroll', height: '100vh' }}>
									<input type="checkbox" onChange={this.toggle} id="show_unchanged" />
									<label for="show_unchanged" style={{ fontSize: '12px', color: 'white' }}>Show Unchanged</label>
									<ReactJsonTree.JSONTree
										theme={theme}
										invertTheme={false}
										data={this.state.showUnchanged ? _.merge(_.cloneDeep(left), delta) : delta}
										valueRenderer={valueRenderer(this.viewPartial)}
										postprocessValue={prepareDelta}
										isCustomNode={Array.isArray}
										shouldExpandNodeInitially={expandFirstLevel}
										hideRoot
									/>
								</div>
								{this.state.partial ? <div style={{ flex: 1, padding: '0 10px', overflow: 'hidden', overflowY: 'scroll', height: '100vh' }}>
									<ReactJsonTree.JSONTree
										theme={theme}
										invertTheme={false}
										data={this.state.partial}
										shouldExpandNodeInitially={() => true}
										hideRoot
									/>
								</div> : null}
							</div>
						</div>
					);
				}
			}

			ReactDOM.createRoot(document.querySelector('#app')).render(<App />);
		</script>
	</body>
</html>`;
