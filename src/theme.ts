import * as path from 'path';
import { Renderer, DeclarationReflection, ReflectionKind, Reflection, PageEvent } from 'typedoc';
import { MarkdownTheme } from 'typedoc-plugin-markdown';

const FolderMapping = {
  [ReflectionKind.Module]: 'modules',
  [ReflectionKind.Namespace] : 'namespaces',
  [ReflectionKind.Enum]: 'enums',
  [ReflectionKind.TypeAlias]: 'enums',
  [ReflectionKind.TypeLiteral]: 'enums',
  [ReflectionKind.TypeParameter]: 'enums',
  [ReflectionKind.Class]: 'classes',
  [ReflectionKind.Interface]: 'interfaces'
}

const NavOrder = {
  [ReflectionKind.Module]: 2,
  [ReflectionKind.Class]: 2,
  [ReflectionKind.Interface]: 3,
  [ReflectionKind.Namespace]: 4,
  [ReflectionKind.Enum]: 5,
  [ReflectionKind.TypeAlias]: 5,
  [ReflectionKind.TypeLiteral]: 5,
  [ReflectionKind.TypeParameter]: 5,
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
        case 2: {
            parent = 'Classes';
            break;
        }
        case 3: {
            parent = 'Interfaces';
            break;
        }
        case 4: {
            parent = 'Namespaces';
            break;
        }
        case 5: {
            parent = 'Enums';
            break;
        }
    }

    console.log(`> ${packageName} - ${page.model.name} - ${parent} - ${page.model.kind}`);
    if (!namaSpace.length && parent !== undefined) {
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
    } else if (!namaSpace.length && parent === undefined) {
        header = [
            `---`,
            `layout: default`,
            `title: ${page.model.name ?? 'Modules'}`,
            `parent: Reference`,
            `has_toc: false`,
            `nav_order: 1`,
            `---`,
        ].join('\n');
    } else {
      header = [
        `---`,
        `layout: default`,
        `title: Misclaneous`,
        `parent: Reference`,
        `has_toc: false`,
        `nav_order: 5`,
        `---`,
      ].join('\n');
    }

    return `${header}\n\n${pageMarkdown.replace('[birb](README.md) / [Exports](modules.md)', '[Birb](/)')}`;
  }
}
