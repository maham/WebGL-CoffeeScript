Metronome
=========

Dependencies
------------
Metronome will emit a "Tick" at constant intervals. [MicroEvent](microevent.litecoffee) will help with handling of the event
listeners and distribution. We will also make use of the functions in [time](time.litcoffee) to make sure that we have
access to some kind of timekeeper with a good enough resolution.

	MicroEvent	= require 'app/microevent'
	time		= require 'app/time'

Metronome
---------
The Metronome is the pacekeeper of the app. It will keep ticking at a set speed and emit ticks at given intervals.

	module.exports = class Metronome

constructor
-----------
To create a metronome we need the pace of the ticks. `FPS` give us this as Frames Per Second which should be familiar
to most gamers. This will be stored as `timeBetweenTicks`. A couple of other members will be needed later so we make
sure to define them in the constructor.

		constructor: ( FPS ) ->
			@timeBetweenTicks = 1 / FPS
			@lastT = null
			@timeAccumulator = 0

start
-----
When it's time to start the metronome we do so simply by calling it's start method. Here we set `lastT` to the current
timestamp to make sure we don't get a huge jump in the first update. Then we call `tick` and emit a `Start` event to
eventual listeners.

		start: ->
			@lastT = Date.now()
			@tick()
			@emit "Start"
			return

stop
----
If we need to stop the `Metronome` for some reason we first have to cancel the `tick` loop. Then we increase the
`timeAccumulator` with the time since the last `tick` to make sure we don't lose any time. Finally we make sure to send
a `Stop` event to any registered observers.

		stop: ->
			time.cancelAnimationFrame @tick
			t = Date.now()
			@timeAccumulator += ( t - @lastT ) / 1000
			@emit "Stop"
			return

tick
----
The tick method will emit a `Tick` event every time the time given by `timeBetweenTicks` has passed. Multiple `Tick`
events may be sent from a single call to `tick` if enough time has passed. If not enough time has passed no `Tick`
event will be sent. This way the simulation dependent on the ticks will stay consistent.

First we will make sure to request a new call to `tick` as soon as the system is ready. Then we increase
`timeBetweenTicks` with the amount of time that has passed since the last call to `tick`. We emit a `Tick` event for
every time period `timeBetweenTicks` that has passed and `timeAccumulator` is decreased by that amount of time. We
finish by storing the last timestamp in `lastT`.

		tick: =>
			time.requestAnimationFrame @tick

			t = Date.now()
			@timeAccumulator += ( t - @lastT ) / 1000

			while @timeAccumulator > @timeBetweenTicks
				@timeAccumulator -= @timeBetweenTicks
				@emit "Tick"

			@lastT = t
			return

Mixins
------
To add support for event emission we mix [MicroEvent](microevent.html) into the Metronome prototype.

	MicroEvent.Mixin Metronome
