/**
 * The entrypoint for the action. This file simply imports and runs the action's
 * main logic.
 */
import { run } from './runway-upload.js'
import * as core from '@actions/core'

run().catch((error) => {
  core.setFailed((error as Error).message)
})
