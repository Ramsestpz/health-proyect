import {
  IconBuildingHospital,
  IconMedicalCross,
  IconPill,
  IconStethoscope,
  IconTestPipe,
} from '@tabler/icons-react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export const CATEGORY_ICONS = {
  IconBuildingHospital,
  IconPill,
  IconTestPipe,
  IconStethoscope,
  IconMedicalCross,
};

export function getCategoryIcon(name) {
  return Object.hasOwn(CATEGORY_ICONS, name) ? CATEGORY_ICONS[name] : null;
}

export function categoryOptionLabel(icon, name) {
  return `${getCategoryIcon(icon) ? '' : `${icon || ''} `}${name}`;
}

export function categoryIconMarkup(name) {
  const Icon = getCategoryIcon(name);
  return Icon ? renderToStaticMarkup(createElement(Icon, { size: 18, stroke: 1.5, 'aria-hidden': true })) : null;
}
