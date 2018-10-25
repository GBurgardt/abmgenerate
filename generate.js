var fs = require('fs');

// const defaultDir = 'C:/Users/kernel/German/Projects/scriptsAuto/abmGenerate';
const defaultDir = 'C:/Users/kernel/German/Projects/facturacion/src/app/pages/main/tablas';

const upperFirstLetter = (str) => str && str.length > 0 ? 
    str[0].toUpperCase().concat(str.substring(1)) : null;

const writeFile = (dirFile, bodyFile) => 
    fs.writeFile(
        dirFile, 
        bodyFile, 
        (err) => {
            if(err) {
                return console.log(err);
            }
        
            console.log(`${dirFile} was saved`);
        }
    ); 


/**
 * Making structure of folders
 * @param {*} abmName 
 */
const createStructure = (abmName) => {
    const abmDir = `${defaultDir}/${abmName}`;
    if (!fs.existsSync(abmDir)){
        console.log(`Making ${abmName} folder..`)
        fs.mkdirSync(abmDir);

        const componentsDir = `${abmDir}/components`;
        if (!fs.existsSync(componentsDir)){
            console.log(`Making components folder..`)
            fs.mkdirSync(componentsDir);

            const nuevoDir = `${abmDir}/components/nuevo${upperFirstLetter(abmName)}`;
            if (!fs.existsSync(nuevoDir)){
                console.log(`Making nuevo${upperFirstLetter(abmName)} folder..`)
                fs.mkdirSync(nuevoDir);
            }

            const editarDir = `${abmDir}/components/editar${upperFirstLetter(abmName)}`;
            if (!fs.existsSync(editarDir)){
                console.log(`Making editar${upperFirstLetter(abmName)} folder..`)
                fs.mkdirSync(editarDir);
            }
        }
    }
}


const createHtml = (dir, className, title) => {
    const body = 
`<div class="${className}">
<ba-card cardTitle="${upperFirstLetter(title)}" baCardClass="with-scroll">
    
</ba-card>
</div>`

    writeFile(dir, body);
}

const createScss = (dir, className) => {
    const body = 
`.${className} {

}`

    writeFile(dir, body);
}


const createIndexTs = (dir, name) => {
    const body = `export * from './${name}.component';`;
    writeFile(dir, body);
}

/**
 * Crea los files de la carpeta raiz
 */
const createRootFiles = (abmName, abmModelName, abmModelId, nameResource) => {


    const createRootComponentTs = (abmName, abmModelName, abmModelId, nameResource) => {
        const dir = `${defaultDir}/${abmName}/${abmName}.component.ts`;
        const body = 
`import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UtilsService } from '../../../../services/utilsService';
import { RecursoService } from '../../../../services/recursoService';
import { resourcesREST } from 'constantes/resoursesREST';

import { ${upperFirstLetter(abmModelName)} } from 'app/models/${abmModelName}';

@Component({
    selector: '${abmName}',
    styleUrls: ['./${abmName}.scss'],
    templateUrl: './${abmName}.html'
})
export class ${upperFirstLetter(abmName)} {
    tableData;
    tableColumns;

    constructor(
        private router: Router,
        private utilsService: UtilsService,
        private recursoService: RecursoService
    ) {
        this.tableColumns = []
        this.tableData = this.recursoService.getRecursoList(resourcesREST.${nameResource})();
    }

    onClickEdit = (rec: ${upperFirstLetter(abmModelName)}) => {
        this.router.navigate(['/pages/tablas/${abmName}/editar', rec.${abmModelId}]);
    }

    onClickRemove = async(recurso: ${upperFirstLetter(abmModelName)}) => {
        this.utilsService.showModal(
            'Borrar ${abmModelName}'
        )(
            '¿Estás seguro de borrarlo?'
        )(
           async () => {
                await this.recursoService.borrarRecurso(recurso.${abmModelId})(resourcesREST.${nameResource});

                this.tableData = this.recursoService.getRecursoList(resourcesREST.${nameResource})();
            }
        )({
            tipoModal: 'confirmation'
        });
    }

}
`

        writeFile(dir, body);
    }


    createIndexTs(`${defaultDir}/${abmName}/index.ts`, abmName);
    createHtml(`${defaultDir}/${abmName}/${abmName}.html`, abmName, abmName);
    createScss(`${defaultDir}/${abmName}/${abmName}.scss`, abmName);
    createRootComponentTs(abmName, abmModelName, abmModelId, nameResource);
}


const createComponentTs = (dir, abmName, abmModelName, fileName, className, abmModelId, nameResource) => {
    const body = fileName.includes('nuevo') ?
`import { Router } from '@angular/router';
import { UtilsService } from '../../../../../../services/utilsService';
import { RecursoService } from 'app/services/recursoService';
import { Component, Input, HostListener } from '@angular/core';

import { ${upperFirstLetter(abmModelName)} } from '../../../../../../models/${abmModelName}';

@Component({
    selector: '${className}',
    styleUrls: ['./${fileName}.scss'],
    templateUrl: './${fileName}.html',
})

export class ${upperFirstLetter(fileName)} {
    recurso: ${upperFirstLetter(abmModelName)} = new ${upperFirstLetter(abmModelName)}();

    constructor(
        private recursoService: RecursoService,
        private utilsService: UtilsService,
        private router: Router
    ) { }

    ngOnInit() {
        this.recursoService.setEdicionFinalizada(false);
    }

    @HostListener('window:beforeunload')
    canDeactivate = () => 
        this.recursoService.checkIfEquals(this.recurso, new ${upperFirstLetter(abmModelName)}()) || 
        this.recursoService.getEdicionFinalizada();

    onClickCrear = async () => {
        try {
            const resp: any = await this.recursoService.setRecurso(this.recurso)();
    
            this.utilsService.showModal(
                resp.control.codigo
            )(
                resp.control.descripcion
            )(
                () => {
                    this.router.navigate(['/pages/tablas/${abmName}']);
                    this.recursoService.setEdicionFinalizada(true);
                }
            )();
        }
        catch(ex) {
            this.utilsService.decodeErrorResponse(ex);       
        }
    }

}
` :
`import { Component, Input, HostListener } from '@angular/core';
import { UtilsService } from '../../../../../../services/utilsService';
import { Router, ActivatedRoute } from '@angular/router';
import { RecursoService } from 'app/services/recursoService';
import { resourcesREST } from 'constantes/resoursesREST';

import { ${upperFirstLetter(abmModelName)} } from '../../../../../../models/${abmModelName}';

@Component({
    selector: '${className}',
    styleUrls: ['./${fileName}.scss'],
    templateUrl: './${fileName}.html',
})
export class ${upperFirstLetter(fileName)} {
    recurso: ${upperFirstLetter(abmModelName)} = new ${upperFirstLetter(abmModelName)}();
    recursoOriginal: ${upperFirstLetter(abmModelName)} = new ${upperFirstLetter(abmModelName)}();

    constructor(
        private utilsService: UtilsService,
        private router: Router,
        private route: ActivatedRoute,
        private recursoService: RecursoService
    ) {
        this.route.params.subscribe(params => 
            this.recursoService.getRecursoList(resourcesREST.${nameResource})()
                .map((recursoList: ${upperFirstLetter(abmModelName)}[]) =>
                    recursoList.find(recurso => recurso.${abmModelId} === parseInt(params.${abmModelId}))
                )
                .subscribe(recurso =>{
                    this.recurso = recurso;
                    this.recursoOriginal = Object.assign({}, recurso);
                })
        );
    }

    
    ngOnInit() {
        this.recursoService.setEdicionFinalizada(false);
    }

    // Si NO finalizó la edición, y SI editó el recurso..
    @HostListener('window:beforeunload')
    canDeactivate = () => 
        this.recursoService.getEdicionFinalizada() ||
        this.recursoService.checkIfEquals(this.recurso, this.recursoOriginal);

    onClickEditar = async() => {
        try {
            const respuestaEdicion: any = await this.recursoService.editarRecurso(
                this.recurso
            )();
    
            this.utilsService.showModal(
                respuestaEdicion.control.codigo
            )(
                respuestaEdicion.control.descripcion
            )(
                () => {
                    this.router.navigate(['/pages/tablas/${abmName}']);
                    this.recursoService.setEdicionFinalizada(true);
                }
            )();
        }
        catch(ex) {
            this.utilsService.decodeErrorResponse(ex);
            
        }
    }

}
`

    writeFile(dir, body);
}

/**
 * Crea nuevo y editar
 */
const createComponentFiles = (abmName, abmModelName, abmModelId, nameResource) => {
    const createNuevo = (abmName, abmModelName, abmModelId) => {
        const dirComponents = `${defaultDir}/${abmName}/components/`;
        const fileName = `nuevo${upperFirstLetter(abmName)}`;
        const className = `nuevo-${abmName}`;

        createIndexTs(`${dirComponents}/${fileName}/index.ts`, fileName);
        createHtml(`${dirComponents}/${fileName}/${fileName}.html`, className, `Nuevo ${abmModelName}`);
        createScss(`${dirComponents}/${fileName}/${fileName}.scss`, className);

        createComponentTs(`${dirComponents}/${fileName}/${fileName}.component.ts`, abmName, abmModelName, fileName, className, abmModelId, nameResource);
    }

    const createEditar = (abmName, abmModelName, abmModelId) => {
        const dirComponents = `${defaultDir}/${abmName}/components/`;
        const fileName = `editar${upperFirstLetter(abmName)}`;
        const className = `editar-${abmName}`;

        createIndexTs(`${dirComponents}/${fileName}/index.ts`, fileName);
        createHtml(`${dirComponents}/${fileName}/${fileName}.html`, className, `Modificar ${abmModelName}`);
        createScss(`${dirComponents}/${fileName}/${fileName}.scss`, className);

        createComponentTs(`${dirComponents}/${fileName}/${fileName}.component.ts`, abmName, abmModelName, fileName, className, abmModelId, nameResource);
    }
    createEditar(abmName, abmModelName, abmModelId);
    createNuevo(abmName, abmModelName, abmModelId);
}

const generate = () => {
    const readline = require('readline-sync');

    const abmName = readline.question('Nombre abm: ')
    const abmModelName = readline.question('Nombre model: ')
    const abmModelId = readline.question('Nombre id model: ')
    const nameResource = readline.question('Nombre resource: ')

    createStructure(abmName);
    createRootFiles(abmName, abmModelName, abmModelId, nameResource)
    createComponentFiles(abmName, abmModelName, abmModelId, nameResource)
}

generate()

