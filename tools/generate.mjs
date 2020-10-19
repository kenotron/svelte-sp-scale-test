import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const root = path.resolve(__dirname, "../");

// 5, 3, 5 is original
const MaxComponentDepth = 1;
const EntryComponentNumber = 1;
const ChildrenPerComponent = 1000;

fs.rmdirSync(path.join(root, "src/components"), { recursive: true });

let idCount = [];

const componentMap = new Map();

for (let i = 0; i < EntryComponentNumber; i++) {
    const component = generateComponent(0, 'Entry');
}

function generateComponent(depth = 0, prefix = 'Comp',) {
    idCount[depth] = idCount[depth] || 0;
    const id = `${depth.toString().padStart(2, "0")}${(idCount[depth]++).toString().padStart(4, "0")}`;

    const children = [];
    const component = {
        id,
        depth,
        name: `${prefix}${id}`,
        children,
    };

    componentMap.set(component.id, component);

    if (depth < MaxComponentDepth) {
        for (let i = 0; i < ChildrenPerComponent; i++) {
            const child = generateComponent(depth + 1);
            component.children.push(child.id);
        }
    }

    return component;
}

for (const [id, component] of componentMap.entries()) {
    const componentPath = path.join(
        root,
        "src/components",
        `${component.name}.svelte`
    );
    const contents = `
    <script>
${component.children &&
        component.children
            .map(
                (child) =>
                    `import ${componentMap.get(child).name} from '$components/${componentMap.get(child).name
                    }';`
            )
            .join("\n")
        }
        </script>
        <div>
        I'm component ${component.name}
          <div>${component.children &&
        component.children
            .map(
                (child) =>
                    `<${componentMap.get(child).name}></${componentMap.get(child).name
                    }>';`
            )
            .join("\n")
        }
            </div>
        </div>
`;
    fs.mkdirSync(path.dirname(componentPath), { recursive: true });
    fs.writeFileSync(componentPath, contents);
}
