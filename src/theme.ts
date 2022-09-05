import * as path from 'path';
import { Renderer, DeclarationReflection, ReflectionKind, Reflection, PageEvent } from 'typedoc';
import { MarkdownTheme } from 'typedoc-plugin-markdown';

const FolderMapping = {
  [ReflectionKind.Module]: 'modules',
  [ReflectionKind.Namespace] : 'namespaces',
  [ReflectionKind.Enum]: 'enums',
  [ReflectionKind.Class]: 'classes',
  [ReflectionKind.Interface]: 'interfaces'
}

// Todo: make it a theme configuration
const NavOrder = {
  [ReflectionKind.Module]: 1,
  [ReflectionKind.Class]: 1,
  [ReflectionKind.Interface]: 2,
  [ReflectionKind.Namespace]: 3,
  [ReflectionKind.Enum]: 4,
}

const normalizeName = (name: string) => {
  return name.replace('@', '').replace('/', '-');
}

export class JustTheDocsTheme extends MarkdownTheme {
  constructor(renderer: Renderer) {
    super(renderer);
  }

  toUrl(mapping: any, reflection: DeclarationReflection) {
    const [module, ...namaSpace] = reflection.getFullName()?.split('.');
    const moduleFolderName = normalizeName(module);

    let finalPath;
    if (!namaSpace.length) {
      finalPath = `${moduleFolderName}.md`;
    } else {
      finalPath = `${path.join(moduleFolderName, FolderMapping[reflection.kind], namaSpace.join('-'))}.md`;
    }
    
    return path.join(finalPath);
  }

  render(page: PageEvent<Reflection>) {
    const pageMarkdown = super.render(page);
    const [packageName, ...namaSpace] = page.model.getFullName()?.split('.');

    let header: string;
    let parent: string;
    const type = NavOrder[page.model.kind];

    switch (type) {
        case 1: {
            parent = 'Classes';
            break;
        }
        case 2: {
            parent = 'Interfaces';
            break;
        }
        case 3: {
            parent = 'Namespaces';
            break;
        }
        case 4: {
            parent = 'Enums';
            break;
        }
    }

    if (!namaSpace.length && parent) {
      header = [
        `---`,
        `layout: default`,
        `title: ${page.model.name}`,
        `parent: ${parent}`,
        `grand_parent: Reference`,
        `has_toc: false`,
        `nav_order: 1`,
        `---`,
      ].join('\n');
    } if (!namaSpace.length && !parent) {
        header = [
            `---`,
            `layout: default`,
            `title: Modules`,
            `parent: Reference`,
            `has_toc: false`,
            `nav_order: 5`,
            `---`,
        ].join('\n');
    } else {
      header = [
        `---`,
        `layout: default`,
        `title: Modules`,
        `parent: Reference`,
        `has_toc: false`,
        `nav_order: 5`,
        `---`,
      ].join('\n');
    }

    return `${header}\n\n${pageMarkdown.replace('[birb](README.md) / [Exports](modules.md)', '[Birb](/)')}`;
  }
}
