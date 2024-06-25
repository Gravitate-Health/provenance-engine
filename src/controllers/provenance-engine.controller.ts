import {inject} from '@loopback/core';
import { Filter } from '@loopback/repository';
import {
  Request,
  RestBindings,
  get,
  response,
  ResponseObject,
  param,
  Response,
} from '@loopback/rest';
import AxiosController from '../services/axios.services';

require('dotenv').config()

/**
 * OpenAPI response for ping()
 */

/**
 * A simple controller to bounce back http requests
 */

let {FHIR_SERVER_URL} = process.env as any;

export class PingController {
  axiosController: AxiosController;
  constructor(
    @inject(RestBindings.Http.REQUEST) private req: Request,
    @inject(RestBindings.Http.RESPONSE) private response: Response,) {
      console.log("FHIR_SERVER_URL: ", FHIR_SERVER_URL);
      this.axiosController = new AxiosController(FHIR_SERVER_URL);
    }

  
  @get('/')
  async getProvenance(
    @param.query.string('resourceId') resourceId: string,
  ): Promise<any[]> {
    if (!resourceId) {
      this.response.status(400).send('resourceId is required');
      return [];
    }

    let provenanceResult = await this.searchProvenanceRecursively(resourceId);
    //return targets;
    return provenanceResult;
  }

  async searchProvenanceRecursively(target: string, provenanceIds: string[] = [], targets: string[] = []): Promise<any> {
    console.log("Searching Provenance for target: ", target);
    if (!target) {
      return [];
    }
    if (!targets.includes(target)) {
      targets.push(target);
    }
    let provenances = [];

    // Request provenances
    let response;
    try {
      response = await this.axiosController.request.get(`${FHIR_SERVER_URL}/Provenance?target=${target}&_count=9999`);
    } catch (error) {
      console.error("Error gettting Provenance for resourceId: ", target + " From server: " + FHIR_SERVER_URL)
      console.error(error);
      throw error;
    }
    if (!response || response.status !== 200) {
      return [];
    }

    let provenanceResult = response.data as any;

    // Iterate over all provenances
    
    let provenanceEntries = provenanceResult["entry"];
    if (!provenanceEntries || provenanceEntries.length === 0) { 
      return [];
    }
    let newTargetCounter = 0;
    console.log("Provenance entries: ", provenanceEntries.length);
    for (let i in provenanceEntries) {
      let provenance = provenanceEntries[i];
      let provenanceId = provenance.resource.id;
      if (!provenanceIds.includes(provenanceId)) {
        provenanceIds.push(provenanceId);
        provenances.push(provenance);
      }

      // Get all targets of the provenance
      let newProvenanceTargets = this.getProvenanceTargets(provenance);

      // add only new targets
      for (let newTarget of newProvenanceTargets) {
        if (!targets.includes(newTarget)) {
          targets.push(newTarget);
          console.log("New target: ", newTarget);
          newTargetCounter++;
        }
      }
    }
    console.log("New target counter: ", newTargetCounter);
    if (newTargetCounter === 0) {
      console.log("No new targets found. Returning provenances.");
      return provenances;
    }

    console.log("Searching for provenance for new targets")
    for (let newTargetToSearch of targets) {
      //target = `${FHIR_SERVER_URL}/${target}`
      let targetProvenances = await this.searchProvenanceRecursively(newTargetToSearch, provenanceIds, targets);
      provenances = provenances.concat(targetProvenances);
    }


    return provenances;
  }

  getProvenanceTargets(provenance: any): any[] {
    let targets = [];
    if (provenance && provenance.resource.target) {
      for (let target of provenance.resource.target) {
        targets.push(`${FHIR_SERVER_URL}/${target.reference}`);
      }
    }
    return targets;
  }
}