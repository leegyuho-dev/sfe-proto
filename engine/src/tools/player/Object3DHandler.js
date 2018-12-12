
import {
    isEmpty,
    isArray,
    isObject,
} from '../../common/functions.js';

export class Object3DHandler {
    constructor() {
    }

    ready(model, Assets, options) {
        // 메시 객체
        model.meshes = {}
        // 매터리얼 객체
        model.materials = {}
        // 본 객체
        model.bones = {}
    
        const defaultMaterials = {}
        // https://threejs.org/docs/#api/en/core/Object3D.traverse
        model.traverse(function (child) {
            if (child.isMesh) {
                var childMesh = child;
                model.meshes[childMesh.name] = childMesh;
                Assets.meshes[childMesh.name] = childMesh;
                // 모델 메시 및 매터리얼 처리
                childMesh.castShadow = options.mesh.castShadow;
                childMesh.receiveShadow = options.mesh.receiveShadow;
                childMesh.frustumCulled = options.mesh.frustumCulled;
                // child.visible = false;
    
                childMesh.materialSlots = {}
                if (isArray(childMesh.material)) {
                    for (var key in childMesh.material) {
                        var materialName = childMesh.material[key].name;
                        childMesh.material[key].fog = options.material.fog;
                        defaultMaterials[materialName] = childMesh.material[key];
                        childMesh.materialSlots[key] = materialName;
    
                        if (Assets.materials[materialName] === undefined) {
                            Assets.materials[materialName] = {}
                        }
                        Assets.materials[materialName].default = childMesh.material[key];
                    }
                } else {
                    var materialName = childMesh.material.name;
                    childMesh.material.fog = options.material.fog;
                    defaultMaterials[materialName] = childMesh.material;
                    childMesh.materialSlots = materialName;
    
                    if (Assets.materials[materialName] === undefined) {
                        Assets.materials[materialName] = {}
                    }
                    Assets.materials[materialName].default = childMesh.material;
                }
            } else if (child.isBone && child.name !== child.parent.name) {
                var childBone = child;
                // 본 객체 생성
                model.bones[child.name] = childBone;
            }
        });
        model.materials = defaultMaterials;
    
        // 본 객체 참조 추가
        if (!isEmpty(model.bones)) {
            // 루트본 그룹
            // const rootName = model.animations[0].tracks[0].name.split('.')[0];
            for (var key in model.children) {
                if (model.children[key].type === 'Group' && !isEmpty(model.children[key].children) ||
                    model.children[key].type === 'Bone' && !isEmpty(model.children[key].children)) {
                    if (model.children[key].children[0].type === 'Bone') {
                        model.bones.root = model.children[key];
                    }
                }
            }
            // 스켈레톤 헬퍼 추가
            /* this.helpers.skeleton = new THREE.SkeletonHelper( model.bones.root );
            // this.helpers.skeleton.material.linewidth = 10;
            this.helpers.add(this.helpers.skeleton);
            console.log(this.helpers.skeleton);
    
            // https://discourse.threejs.org/t/object-bounds-not-updated-with-animation/3749/7
            this.helpers.boundingBox = new THREE.BoxHelper(this.helpers.skeleton, 0x00ff00);
            this.helpers.add(this.helpers.boundingBox); */
    
        }
    
        return model;
    
    }

    add(model, Assets, options) {
        const defaultMaterials = model.materials;
        /* var defaultMaterials = {}
        for (var index in model.children) {
            var child = model.children[index];
            if (child.materialSlots !== undefined) {
                if (isObject(child.materialSlots)) {
                    for (var i in child.materialSlots) {
                        var materialName = child.materialSlots[i];
                        if (defaultMaterials[materialName] === undefined) {
                            defaultMaterials[materialName] = Assets.materials[materialName].default; 
                        }
                    }
                } else {
                    var materialName = child.materialSlots;
                    if (defaultMaterials[materialName] === undefined) {
                        defaultMaterials[materialName] = Assets.materials[materialName].default; 
                    }
                }
            }
        } */
    
        // 추가 매터리얼 및 메시
        // model.materials.diffuse = {}
        // model.materials.flat = {}
        // model.materials.edgedFace = {}
        // model.materials.wireframe = {}
        // model.materials.toon = {}
        // model.materials.cel = {}
        // model.materials.outline = {}
        // model.materials.outlineDefault = {}
    
        // 매터리얼 복사
        for (var materialName in defaultMaterials) {
    
            // 디퓨즈 매터리얼
            var diffuseMaterial = new THREE.MeshBasicMaterial();
            diffuseMaterial.copy(defaultMaterials[materialName]);
            diffuseMaterial.lights = false;
            diffuseMaterial.specularMap = null;
            diffuseMaterial.envMap = null;
            diffuseMaterial.emissiveMap = null;
            diffuseMaterial.normalMap = null;
            Assets.materials[materialName].diffuse = diffuseMaterial;
    
            // 플랫 매터리얼
            var flatMaterial = new THREE.MeshPhongMaterial();
            flatMaterial.copy(defaultMaterials[materialName]);
            flatMaterial.flatShading = true;
            flatMaterial.color = new THREE.Color(0.8, 0.8, 0.8);
            flatMaterial.side = 0;
            flatMaterial.opacity = 1;
            flatMaterial.transparent = false;
            flatMaterial.blending = 1;
            flatMaterial.map = null;
            flatMaterial.specularMap = null;
            flatMaterial.specular = new THREE.Color(0x000000);
            flatMaterial.envMap = null;
            flatMaterial.reflectivity = 0;
            flatMaterial.shininess = 0;
            flatMaterial.emissive = new THREE.Color(0x000000);
            flatMaterial.emissiveIntensity = 0;
            flatMaterial.emissiveMap = null;
            flatMaterial.normalMap = null;
            flatMaterial.polygonOffset = true;
            flatMaterial.polygonOffsetFactor = 1;
            flatMaterial.polygonOffsetUnits = 1;
            Assets.materials[materialName].flat = flatMaterial;
            Assets.materials[materialName].edgedFace = flatMaterial;
    
            // 플랫 매터리얼 (블랙)
            /* var flatMaterial = new THREE.MeshPhongMaterial();
            flatMaterial.copy(defaultMaterials[materialName]);
            flatMaterial.color = new THREE.Color(0x000000);
            flatMaterial.side = 0;
            flatMaterial.opacity = 1;
            flatMaterial.transparent = false;
            flatMaterial.blending = 1;
            flatMaterial.map = null;
            flatMaterial.specularMap = null;
            flatMaterial.specular = new THREE.Color(0.2, 0.2, 0.2);
            flatMaterial.shininess = 0;
            flatMaterial.envMap = null;
            flatMaterial.reflectivity = 0;
            flatMaterial.emissive = new THREE.Color(0x000000);
            flatMaterial.emissiveIntensity = 0;
            flatMaterial.emissiveMap = null;
            flatMaterial.normalMap = null;
            flatMaterial.polygonOffset = true;
            flatMaterial.polygonOffsetFactor = 1;
            flatMaterial.polygonOffsetUnits = 1; */
    
            // 와이어프레임 매터리얼
            var wireframeMaterial = new THREE.MeshPhongMaterial();
            wireframeMaterial.copy(flatMaterial);
            wireframeMaterial.wireframe = true;
            wireframeMaterial.color = new THREE.Color(0x000000);
            wireframeMaterial.opacity = 0.2;
            wireframeMaterial.transparent = true;
            // wireframeMaterial.depthWrite = false;
            Assets.materials[materialName].wireframe = wireframeMaterial;
    
            // 와이어프레임 매터리얼 (화이트)
            /* var wireframeMaterial = new THREE.MeshPhongMaterial();
            wireframeMaterial.copy(flatMaterials[materialName]);
            wireframeMaterial.wireframe = true;
            wireframeMaterial.color = new THREE.Color(0.1, 0.1, 0.1);
            wireframeMaterial.opacity = 0.5;
            wireframeMaterial.transparent = true;
            wireframeMaterial.specular = new THREE.Color(0.8, 0.8, 0.8);
            wireframeMaterial.shininess = 12; */
    
            // 툰 매터리얼
            // var toonMaterial = new THREE.MeshToonMaterial();
            // toonMaterial.copy(defaultMaterials[materialName]);
            // toonMaterial.gradientMap = null;
            // toonMaterial.emissiveIntensity = 0;
            // toonMaterial.emissiveMap = null;
            // Assets.materials[materialName].toon = toonMaterial;
    
            // 셀 매터리얼
            // var celMaterial = new THREE.MeshCelShaderMaterial(defaultMaterials[materialName]);
            // Assets.materials[materialName].cel = celMaterial;
    
            // 아웃라인 매터리얼
            // var outlineMaterial = new THREE.MeshOutlineMaterial(defaultMaterials[materialName], options.outline);
            // var outlineMaterialDefault = new THREE.MeshOutlineMaterial(defaultMaterials[materialName], options.outline, true);
            // Assets.materials[materialName].outline = outlineMaterial;
            // Assets.materials[materialName].outlineDefault = outlineMaterialDefault;
        }
        
        // 메시 복사
        // objectId = shadingMode
        const clonesMeshes = {
            wireframes: 'wireframe',
            // outlines: (options.outline.enabled === true)? 'outline' : 'outlineDefault',
        }
    
        for (var objectId in clonesMeshes) {
            const group = new THREE.Group();
            group.name = objectId;
            group.visible = false;
            var shadingMode = clonesMeshes[objectId]; 
            for (var key in model.meshes) {
                var clonedMesh = model.meshes[key].clone();
                clonedMesh.material = [];
                if (clonedMesh.type === 'SkinnedMesh') {
                    clonedMesh.bind(model.meshes[key].skeleton, model.meshes[key].matrix);
                }
                clonedMesh.morphTargetDictionary = model.meshes[key].morphTargetDictionary;
                clonedMesh.morphTargetInfluences = model.meshes[key].morphTargetInfluences;
                clonedMesh.materialSlots = model.meshes[key].materialSlots;
                if (objectId === 'wireframes' || objectId === 'outlines') {
                    clonedMesh.castShadow = false;
                    clonedMesh.receiveShadow = false;
                }
    
                if (isObject(clonedMesh.materialSlots)) {
                    for (var index in clonedMesh.materialSlots) {
                        var materialName = clonedMesh.materialSlots[index];
                        clonedMesh.material.push(Assets.materials[materialName][shadingMode]);
                    }
                } else {
                    var materialName = clonedMesh.materialSlots;
                    clonedMesh.material = Assets.materials[materialName][shadingMode];
                }
    
                group.add(clonedMesh);
            }
            model[objectId] = group;
            model.add(group);
        }
        /* if (options.outline.enabled === true) {
            model.outlines.visible = true;
        } */
    
        // 스켈레톤 헬퍼 추가
        /* if (!isEmpty(model.bones)) {
            this.helpers.skeleton = new THREE.SkeletonHelper( model.bones.root );
            // this.helpers.skeleton.material.linewidth = 10;
            this.helpers.add(this.helpers.skeleton);
            console.log(this.helpers.skeleton);
    
            // https://discourse.threejs.org/t/object-bounds-not-updated-with-animation/3749/7
            this.helpers.boundingBox = new THREE.BoxHelper(this.helpers.skeleton, 0x00ff00);
            this.helpers.add(this.helpers.boundingBox);
    
        } */
    
        return model;
    
    }

}