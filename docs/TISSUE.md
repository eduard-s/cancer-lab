# Tissue model and reference images

## Live tissue model

Each cancer type has a separate tissue layout. The anatomy link beside the fields identifies the reference for that layout.
Both fields start with the same cells. The drawing uses arbitrary dimensions. The number of cells describes only the drawing.

Each factor has a mark with a distinct shape within its cancer type. The factor table shows its color, current rate, and cumulative amount.
More marks or stronger marks show a greater value within that factor's display range. Physical activity uses this same display rule.
The marks do not represent mutations, cell damage, or a biological reaction to a dose.

The display uses the current rate and the cumulative amount to set mark strength. The rate in the table changes on the selected date.
The rate component of the mark changes gradually during the next simulated year. This transition helps readers see the change.
The cumulative component keeps the earlier exposure history.

The dark cluster starts with five cells. The example pace controls the number of cells in both fields.
The first change in an included factor sets the date for the optional assumed course. The two clusters match through that date.

| Assumed course | Change field after the first rate change |
| --- | --- |
| Match pace | The cluster keeps the pace of the Continue field. |
| Slower expansion | The drawing advances at one third of the selected pace. |
| Plateau | The cluster keeps the number of cells it had on the change date. |
| Regression | The drawing removes cells from the cluster. The underlying tissue stays visible. |

If all the rates match, both clusters keep the same pace. Exposure amounts, inherited risk, and reported stress cannot select a course.
Use the cell controls to examine the same location in each field. A cell can be present in only one field after the assumed course starts.

An inherited finding adds a label to one example nucleus in each field. Both fields share the inherited background.
The label has no effect on the exposure values, the example course, or the number of cells in the cluster.

## Reference micrographs

Each image shows one tissue specimen. The exposure controls do not change the specimen. The detail control enlarges part of the same photograph.

The package includes WebP copies of the images. The copies keep the original colors and aspect ratios. The image frame can crop the edges.

| File | Tissue specimen | Author and source | Image license |
| --- | --- | --- | --- |
| `lung.webp` | Poorly differentiated squamous cell carcinoma in a lung biopsy | [Mikael Häggström, M.D.](https://commons.wikimedia.org/wiki/File:Histopathology_of_squamous-cell_carcinoma_of_the_lung.jpg) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `oral.webp` | Well-differentiated squamous cell carcinoma in an oral biopsy | [KGH](https://commons.wikimedia.org/wiki/File:Oral_cancer_%281%29_squamous_cell_carcinoma_histopathology.jpg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| `colorectal.webp` | Moderately differentiated colorectal carcinoma with dirty necrosis | [Mikael Häggström, M.D.](https://commons.wikimedia.org/wiki/File:Micrograph_of_colorectal_carcinoma_with_dirty_necrosis.jpg) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `breast.webp` | Invasive ductal carcinoma of the breast | [Mikael Häggström, M.D.](https://commons.wikimedia.org/wiki/File:Histopathology_of_invasive_ductal_carcinoma,_intermediate_magnification.jpg) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |

The oral image is a resized WebP copy of “Oral cancer (1) squamous cell carcinoma histopathology.” The copy uses the same CC BY-SA 3.0 license.
