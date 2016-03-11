# comparecsv-tofix

Compare CSV files before upload in to-fix. the CSV files must come from [osmlint2csv](https://github.com/osmlab/osmlint2csv).

`comparecsv-to-fix` will extract data from to-fix DB, the items that have been marked as `not-an-error` and then `comparecsv-to-fix` will read the new file which you want to upload to-fix, finally the app will  make a comparison between these two datasets,  the output will be items that have not been marked as `not-an-error`.

This will help on focused in items which need to resolve through to-fix. and not on the `not-an-error` issues.

## Setting up  the access to DB

For accessing to the database you are required to set the environment variables


```
  export DBUsername='postgres'
  export DBPassword='1234'
  export DBAddress='database'
  export Database='dbtofix'

```

## Install

```
git clone https://github.com/osmlab/comparecsv-to-fix.git
cd comparecsv-to-fix/
npm install && npm link
```

## How to use

```
comparecsvtofix --idtask=unconnectedmajor nodeendingnearhighway.csv > result.csv

```