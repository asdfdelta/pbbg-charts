# pbbg-charts
Data collection and processing of PBBG Charts

## API Guide

CHARTS

> NOTE: All counts are in order by day, the 0 index being the most recent day.

All Charts:
```
https://lite.pbbg.com/api/charts
```
Returns
```javascript
[
  {
    "origin":"https://farmrpg.com/",
    "peak":1556,
    "current":1396,
    "counts":[1396,1452,1545,1528,1535,1556,1523],
    "source":"api",
    "name":"farmrpg",
    "displayName":"FarmRPG",
    "tags":["farming","crafting","economy","idle","rpg"]
  }.
]
```

Specific Chart:
```
https://lite.pbbg.com/api/charts?name=farmrpg
```
Returns
```javascript
{
  "origin":"https://farmrpg.com/",
  "peak":1556,
  "current":1396,
  "counts":[1396,1452,1545,1528,1535,1556,1523],
  "source":"api",
  "name":"farmrpg",
  "displayName":"FarmRPG",
  "tags":["farming","crafting","economy","idle","rpg"]
}
```
