class Node {
    constructor(level, x, y, z) {
        this.level = level;
        this.x = x;
        this.y = y;
        this.z = z;

        
    }

    get children() {
        if (!this._children) {
          
            const xMin = this.x * 2;
            const yMin = this.y * 2;
            const zMin = this.z * 2;
            const yMax = yMin + 1;
            const xMax = xMin + 1;
            const zMax = zMin + 1;
            const childLevel = this.level + 1;
            
            const childCoords = [
                [childLevel, xMin, yMin, zMin],
                [childLevel, xMax, yMin, zMin],
                [childLevel, xMin, yMax, zMin],
                [childLevel, xMax, yMax, zMin],
                [childLevel, xMin, yMin, zMax],
                [childLevel, xMax, yMin, zMax],
                [childLevel, xMin, yMax, zMax],
                [childLevel, xMax, yMax, zMax],
            ];
            
            this._children = childCoords.map(([level, x, y, z]) => {
                return new Node(level, x, y, z);
            });
        }

        return this._children;
    }
}

if (true) {

    let internalNodeCount = 0;
    const internalNodeOctreeData = [];
    function buildOctree(
        node,
        childOctreeIndex, // 当前节点的编号
        childEntryIndex, // 当前节点在list中索引位置
        parentOctreeIndex, // 父节点编号
        parentEntryIndex
    ) {
        if (node.level == 2) {
            internalNodeOctreeData[parentEntryIndex] = childOctreeIndex;
            
            internalNodeCount++;
        } else {
            
            console.log('----',childEntryIndex, parentOctreeIndex, parentEntryIndex, childOctreeIndex)
            // 数据存储是从低级别到高级别一次存储
            internalNodeOctreeData[parentEntryIndex] = 0 | childOctreeIndex;
            internalNodeOctreeData[childEntryIndex] = parentOctreeIndex;
            // console.log(childEntryIndex, parentOctreeIndex)
            // 子找父， list[val * 9]
            // 父找子， list[val * 9 + 1]
            internalNodeCount++;
            // Recurse over children
            
            parentOctreeIndex = childOctreeIndex;
            parentEntryIndex = parentOctreeIndex * 9 + 1;
            const n = [];
            for (let cc = 0; cc < 8; cc++) {
                const child = node.children[cc];
                childOctreeIndex = internalNodeCount;
                childEntryIndex = childOctreeIndex * 9 + 0;
                // console.log(childEntryIndex)
                n.push(childEntryIndex)
                buildOctree(
                child,
                childOctreeIndex, // 1
                childEntryIndex, // 9
                parentOctreeIndex, // 0
                parentEntryIndex + cc // 1
                );

                if (childOctreeIndex == 2) {
                    // console.log('-----', parentOctreeIndex, parentEntryIndex + cc)
                }
            }
        }

        
        //   console.log(n, node.level)
        //   console.log(internalNodeCount)
    }

    const node = new Node(0, 0, 0, 0);

    buildOctree(node, 0 , 0, 0, 0);
    for (let i = 0; i < internalNodeOctreeData.length; i++) {
        // console.log(i, internalNodeOctreeData[i]);
    }
    console.log(internalNodeOctreeData)
    console.log(internalNodeOctreeData[1 * 9 + 1]) // 父找子
}



if (false) 
{
    let start = [0, 0, 0];
    let end = [1, 1, 1];

    function add(x, y) {
        return [x[0] + y[0], x[1] + y[1], x[2] + y[2]]
    }
    function mul(x, s) {
        return x.map(it => it * s);
    }

    function mul2(a, b) {
        return [a[0] * b[0],a[1] * b[1],a[2] * b[2]]
    }
    const shapePosition = [0.6, 0.4, 0.4];
    const traversalData = {
        octreeCoords: [0, 0, 0, 0]
    };

    const step = (edge, x) => {
        return [
            x[0] > edge[0] ? 1 : 0,
            x[1] > edge[1] ? 1 : 0,
            x[2] > edge[2] ? 1 : 0,
        ]
    }

    function mix(x, y, a) {
        // return x×(1−a)+y×a 
        return add(mul2(x, [1 - a[0], 1 - a[1], 1 - a[2]]) , mul2(y, a));
    }
    for (let i = 0; i < 32; ++i) {
            
        const t = mul(add(start, end), 0.5);
        const center = t;
        const childCoord = step(center, shapePosition);
        
        console.log(childCoord)

        const octreeCoords = traversalData.octreeCoords;
        traversalData.octreeCoords = [...add(mul(octreeCoords, 2).slice(0, 3), childCoord), octreeCoords[3] + 1];
        
        // console.log(start, end, childCoord)
        // start = mix(start, center, childCoord);
        end = mix(center, end, childCoord);
        // console.log(start, end, childCoord)
        // console.log(traversalData.octreeCoords)
        // console.log('-----')
    }
}