/**
 * Current open price.
 */
declare let open: series<number>
/**
 * Current high price.
 */
declare let high: series<number>
/**
 * Current low price.
 */
declare let low: series<number>
/**
 * Close price of the current bar when it has closed, or 
 * last traded price of a yet incomplete, realtime bar.
 */
declare let close: series<number>

/**
 * Current bar volume.
 */
declare let volume: series<number>

/**
 * The ask price at the time of the current tick,
 * which represents the lowest price an active seller
 * will accept for the instrument at its current value. 
 */
declare let ask: series<number>
/**
 * The bid price at the time of the current tick, which 
 * represents the highest price an active buyer is willing 
 * to pay for the instrument at its current value.
 */
declare let bid: series<number>

declare let bar_index: series<number>
declare let last_bar_index: series<number>

/**
 * Current time in UNIX format. It is the number of milliseconds
 * that have elapsed since 00:00:00 UTC, 1 January 1970.
 */
declare let timenow: series<number>

declare let second: series<number>
declare let minute: series<number>
declare let hour: series<number>
declare let weekofyear: series<number>
declare let month: series<number>
declare let year: series<number>

function study(title: string) {

}

function plot() {

}