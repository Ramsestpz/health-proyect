import { createElement } from 'react';
import { getCategoryIcon } from '../utils/categoryIconRegistry';

export default function CategoryIcon({ name, ...props }) {
  const Icon = getCategoryIcon(name);
  return Icon ? createElement(Icon, { stroke: 1.5, 'aria-hidden': true, ...props }) : name || '+';
}
