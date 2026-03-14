import _ from "lodash";

export default function paginate(items, pageNumber, pageSize) {
  const skip = (pageNumber - 1) * pageSize;
  return _(items).slice(skip).take(pageSize).value();
}
