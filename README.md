# black-mirror

An application for a connected mirror

<img width="435" height="607" alt="blackMirrorDemo" src="https://github.com/user-attachments/assets/40cc1ae7-5d3f-41c5-bcc5-ce501c6bd701" />


## Modules

### Agenda

Shows upcoming events for today and the next days.

**Provider:** Nylas API

### Clock

Digital clock (24-hour), optional seconds.

**Provider:** None (system time)

### CurrentWeather

Current conditions: temperature, feels-like, wind, icon.

**Provider:** Open-Meteo API

### DailyForecastWeather

Daily min/max and trend for the next N days.

**Provider:** Open-Meteo API

### Draft

Sandbox tile for prototyping/POCs.

**Provider:** None

### HourlyForecastWeather

Next-hours forecast (temperature/precipitation).

**Provider:** Open-Meteo API

### Lists

Simple shopping lists with add/remove/toggle.

**Provider:** Bring API

### Notification

Transient system/user notifications triggered by other modules.

**Provider:** Internal

### StopWatcher

Next departures for saved stops/lines.

**Provider:** Île-de-France Mobilités API via [`@kgrab75/stop-watcher`](https://www.npmjs.com/package/@kgrab75/stop-watcher)

### Switch

Toggle smart devices/scenes.

**Provider:** Generic HTTP/Webhook driver

### TodayDate

Localized date for today.

**Provider:** None (system date)

### TodayPrecipitation

Today’s precipitation probability/accumulation.

**Provider:** Open-Meteo API

### TodayTemp

Today’s min/max (optionally deviation vs. normal).

**Provider:** Open-Meteo API

### WeatherLocation

Displays/sets the location label used by weather tiles.

**Provider:** Open-Meteo API

### Weight

Latest weight and short/medium-term trend.

**Provider:** Withings API

