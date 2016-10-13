# compare osmlint  and tofix data

Compare osmlint output file between to-fix tasks, especially to compare noterror items in task.

## Install

```
git clone https://github.com/osmlab/comparecsv-to-fix.git
cd comparecsv-to-fix/
npm install && npm link
```

## How to use

```
compareosmlinttofix <urloftask> unconnected-major-highways.json > unconnected-major-highways-new.json

```